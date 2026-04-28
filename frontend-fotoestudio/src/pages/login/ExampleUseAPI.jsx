import { useState, useEffect } from 'react'; // 1. Importar useEffect
import { Link } from 'react-router-dom';

const ExampleCitas = () => {
    const [citas, setCitas] = useState([]); // Estado para guardar las citas

    // 2. El Hook va FUERA del return, al inicio de la función
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/citas/')
            .then(response => response.json())
            .then(data => {
                console.log("Datos de la API:", data);
                setCitas(data); // Guardamos los datos en el estado
            })
            .catch(error => console.error("Error conectando:", error));
    }, []);

    return (
        <div className="p-4">
            <h1>Citas del Estudio</h1>
            <ul>
                {/* 3. Mapeamos las citas para mostrarlas en pantalla */}
                {citas.map(cita => (
                    <li key={cita.id}>
                        Cita #{cita.id} - {cita.cliente_nombre} - {cita.paquete_nombre} - ${cita.precio_total} MXN
                    </li>
                ))}
            </ul>
            <Link to="/">Volver al inicio</Link>
        </div>
    );
}

export default ExampleCitas;