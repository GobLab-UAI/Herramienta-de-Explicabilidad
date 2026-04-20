import warnings
import joblib
import re
import sys
import os
import sklearn 
import subprocess
from typing import Optional


def detect_sklearn_version(model_path: str) -> Optional[str]:
    """
    Extracts the scikit-learn version from a model file.
    Uses a two-pass approach:
    1. Binary Inspection (Fast and crash-proof for Cython dtype errors).
    2. Fallback to joblib.load for standard warning extraction.
    """
    detected_version = None
    
    # --- PASS 1: INSPECCIÓN BINARIA FORENSE ---
    # Es a prueba de fallos porque no intenta instanciar los objetos matemáticos incompatibles.
    try:
        with open(model_path, 'rb') as f:
            # Leemos los primeros 5MB (suficiente para encontrar los metadatos de la clase principal)
            datos_binarios = f.read(5 * 1024 * 1024) 
            
            # Buscamos el patrón binario exacto: b'_sklearn_version' seguido de la versión
            match = re.search(b'_sklearn_version.*?([0-9]+\.[0-9]+\.[0-9a-zA-Z\.]+)', datos_binarios)
            if match:
                detected_version = match.group(1).decode('utf-8')
                # print(f"[Info] Versión extraída mediante inspección binaria: {detected_version}")
                return detected_version
    except Exception as e:
        pass # Si esto falla (ej. archivo muy comprimido), pasamos al Pass 2 silenciosamente
        
    # --- PASS 2: CAPTURA DE WARNINGS TRADICIONAL (Fallback) ---
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        try:
            _ = joblib.load(model_path)
            
            for warning in w:
                message = str(warning.message)
                match = re.search(r"from version (\d+\.\d+(?:\.\d+)?)", message)
                if match:
                    detected_version = match.group(1)
                    break
            
            if not detected_version:
                detected_version = sklearn.__version__
                
        except Exception as e:
            error_message = str(e)
            match = re.search(r"from version (\d+\.\d+(?:\.\d+)?)", error_message)
            if match:
                detected_version = match.group(1)
            else:
                print(f"[Critical Error] Failed to read the model or infer the version. Details: {e}")
                sys.exit(1)
                
    return detected_version

def orchestrate_conversion(input_path: str, output_path: str) -> None:
    print(f"\n--- Iniciando pipeline agnóstico para: {input_path} ---")
    
    # 1. Detección Ciega
    version = detect_sklearn_version(input_path)
    print(f"[+] Versión original de scikit-learn detectada: {version}")
    
    # 2. Definir nombre de la imagen
    image_name = f"sandbox_conversor:{version}"
    
    if not os.path.exists(input_path):
        print(f"[Error] No se encontró el archivo: {input_path}")
        sys.exit(1)

    # 3. Construir el Sandbox (¡Aquí faltaba el docker build!)
    print(f"[+] Construyendo entorno aislado (Sandbox) con scikit-learn=={version}...")
    build_command = [
        "docker", "build", 
        "-f", "Dockerfile.sandbox",  # Usa el plano correcto
        "--build-arg", f"SKLEARN_VERSION={version}", 
        "-t", image_name, 
        "."
    ]
    subprocess.run(build_command, check=True)
    
    # 4. Ejecutar la Conversión en el Sandbox usando el Volumen Nombrado
    print("[+] Entorno listo. Ejecutando contenedor Sandbox de conversión...")
    run_command = [
        "docker", "run", "--rm",
        "-v", "xai_shared_data:/shared_uploads", # Montamos el disco duro mágico
        image_name,
        # Pasamos estrictamente los parámetros que recibió la función:
        input_path,   
        output_path   
    ]
    subprocess.run(run_command, check=True)
    print("[+] Conversión exitosa. Saliendo del orquestador.")

if __name__ == "__main__":
    # Esto permite ejecutar el script desde la terminal pasando el origen y el destino
    if len(sys.argv) != 3:
        print("Uso: python modelorchestrator.py <ruta_al_modelo.joblib> <ruta_salida.onnx>")
        sys.exit(1)
    
    archivo_entrada = sys.argv[1]
    archivo_salida = sys.argv[2]
    
    orchestrate_conversion(archivo_entrada, archivo_salida)
