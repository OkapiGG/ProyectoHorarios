import React, {use, useState} from "react";
import { GraduationCap, Mail, Lock, LogIn, Users, UserCog} from 'lucide-react';

function Login(){
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');

    const clickBoton = (e) => {
        e.preventDefault();
        console.log("Enviando a Spring: ", {correo, password});
    };

    return(
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden min-h-[600px]">

                <div className="hidden md:flex flex-col w-1/2 bg-slate-900 text-white p-12 items-center justify-center text-center relative"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/10 p-4 rounded-2xl mb-6 backdrop-blur-sm">
                        <GraduationCap size={48} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Optimización Académica</h1>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                        Gestione horarios, espacios y disponibilidad docente.
                    </p>
                </div>
            </div>

            {/*Falta el formukario y la parte de la izq la azul */}

        </div>
    )

}

export default Login;