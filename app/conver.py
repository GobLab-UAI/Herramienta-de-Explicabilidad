import sys
import joblib
import pandas as pd
from skl2onnx import convert_sklearn
# Agregamos los tensores de texto y enteros
from skl2onnx.common.data_types import FloatTensorType, StringTensorType, Int64TensorType

def convertir_modelo(ruta_entrada, ruta_salida, ruta_dataset):
    print(f"Cargando modelo en memoria segura desde: {ruta_entrada}")
    
    try:
        modelo = joblib.load(ruta_entrada)
    except Exception as e:
        print(f"Error al cargar el modelo. Detalles: {e}")
        sys.exit(1)

    # --- NUEVA LÓGICA DINÁMICA (Con detección de Texto) ---
    print(f"Analizando tipos de datos desde: {ruta_dataset}")
    try:
        # Leemos solo 5 filas para adivinar rápido los tipos de datos
        df = pd.read_csv(ruta_dataset, sep=None, engine='python', nrows=5)
        
        # Sacamos el target si existe, para que no interfiera
        if 'target' in df.columns:
            df = df.drop(columns=['target'])
            
    except Exception as e:
        print(f"Error al leer el CSV. Detalles: {e}")
        sys.exit(1)

    tipos_iniciales = []
    
    if hasattr(modelo, 'feature_names_in_'):
        nombres = modelo.feature_names_in_
        print(f"Detectadas {len(nombres)} características. Evaluando si son texto o números...")
        
        for nombre in nombres:
            tipo_pandas = df[nombre].dtype
            
            # Si Pandas dice que es 'object' o 'category', es Texto
            if tipo_pandas == 'object' or str(tipo_pandas) == 'category':
                tipos_iniciales.append((str(nombre), StringTensorType([None, 1])))
            # Si es un número entero
            elif tipo_pandas == 'int64':
                tipos_iniciales.append((str(nombre), Int64TensorType([None, 1])))
            # Por defecto, números flotantes
            else:
                tipos_iniciales.append((str(nombre), FloatTensorType([None, 1])))
                
    elif hasattr(modelo, 'n_features_in_'):
        n_features = modelo.n_features_in_
        print(f"Características sin nombre. Usando tensor único numérico.")
        tipos_iniciales = [('float_input', FloatTensorType([None, n_features]))]
    else:
        print("Atributos no encontrados. Fallback manual.")
        sys.exit(1)

    print("Convirtiendo a ONNX...")
    modelo_onnx = convert_sklearn(modelo, initial_types=tipos_iniciales)

    with open(ruta_salida, "wb") as f:
        f.write(modelo_onnx.SerializeToString())

    print(f"¡Conversión exitosa! ONNX guardado en: {ruta_salida}")

    # ── Exportar metadata.json junto al .onnx ──────────────────────────
    import json, os
    metadata = {"task": "unknown"}

    if hasattr(modelo, "classes_"):
        classes = [str(c) for c in modelo.classes_]
        metadata = {
            "task": "classification",
            "n_classes": len(classes),
            "classes": classes,
        }
        print(f"[+] Metadatos: {len(classes)} clases → {classes}")
    elif hasattr(modelo, "n_classes_"):
        metadata = {
            "task": "classification",
            "n_classes": int(modelo.n_classes_),
            "classes": [str(i) for i in range(modelo.n_classes_)],
        }
    else:
        print("[!] No se detectaron clases. El metadata.json indicará tarea desconocida.")

    metadata_path = os.path.splitext(ruta_salida)[0] + ".metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Metadata guardada en: {metadata_path}")

if __name__ == "__main__":
    # ¡IMPORTANTE! Cambiamos a 4 argumentos porque ahora recibe el dataset
    if len(sys.argv) != 4:
        print("Uso interno: python convertidor.py <input> <output> <dataset>")
        sys.exit(1)
    
    # sys.argv[0] es el nombre del script
    # sys.argv[1] es ruta_entrada (.pkl)
    # sys.argv[2] es ruta_salida (.onnx)
    # sys.argv[3] es ruta_dataset (.csv)
    convertir_modelo(sys.argv[1], sys.argv[2], sys.argv[3])