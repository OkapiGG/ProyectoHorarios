import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, GraduationCap } from "lucide-react";
import Sidebar from "./components/Sidebar";

const profesores = [
    { id: '219304021', nombre: 'Dr. Armando Paredes', area: 'Sistemas Inteligentes', contrato: 'PTC', estatus: 'ENVIADA', color: 'bg-yellow-400' },
    { id: '219304045', nombre: 'Dra. Beatriz Sánchez', area: 'Ingeniería de Software', contrato: 'PTC', estatus: 'APROBADA', color: 'bg-purple-200 text-purple-800' },
    { id: '219304088', nombre: 'Mtro. Carlos Méndez', area: 'Redes y Seguridad', contrato: 'PA', estatus: 'BORRADOR', color: 'bg-gray-200 text-gray-700' },
    { id: '219304112', nombre: 'Dra. Elena Poniatowska', area: 'Sistemas Inteligentes', contrato: 'PTC', estatus: 'ENVIADA', color: 'bg-yellow-400' },
];

function ProfesorView() {
    const navigate = useNavigate();
    
    return (
        <div className="flex h-screen bg-sigho-bg font-sans overflow-hidden">

            {/* Sidebar */}

            <Sidebar />


            
            {/* contenido principal */}

        </div>
    );
}

export default ProfesorView;