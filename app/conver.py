# convertidor.py
import sys
import joblib
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

def convertir_modelo(ruta_entrada, ruta_salida):
    print(f"Cargando modelo en memoria segura desde: {ruta_entrada}")
    
    try:
        modelo = joblib.load(ruta_entrada)
    except Exception as e:
        print(f"Error al cargar el modelo. Detalles: {e}")
        sys.exit(1)

    # --- NUEVA LÓGICA DINÁMICA ---
    if hasattr(modelo, 'feature_names_in_'):
        nombres = modelo.feature_names_in_
        print(f"Detectadas {len(nombres)} características. Generando mapeo exacto por columnas.")
        # Creamos una entrada individual para cada columna con su nombre original
        tipos_iniciales = [(str(nombre), FloatTensorType([None, 1])) for nombre in nombres]
    elif hasattr(modelo, 'n_features_in_'):
        n_features = modelo.n_features_in_
        print(f"Detectadas {n_features} características sin nombre. Usando tensor único.")
        tipos_iniciales = [('float_input', FloatTensorType([None, n_features]))]
    else:
        print("Atributos de características no encontrados. Se asume fallback manual.")
        sys.exit(1)

    print("Convirtiendo a ONNX...")
    modelo_onnx = convert_sklearn(modelo, initial_types=tipos_iniciales)

    with open(ruta_salida, "wb") as f:
        f.write(modelo_onnx.SerializeToString())
    
    print(f"¡Conversión exitosa! ONNX guardado en: {ruta_salida}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso interno: python convertidor.py <input> <output>")
        sys.exit(1)
    
    convertir_modelo(sys.argv[1], sys.argv[2])