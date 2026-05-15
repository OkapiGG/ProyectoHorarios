import { createCatalogService } from "./CrearService";

const usuarioService = createCatalogService("http://localhost:8080/api/usuarios");

export const crearUsuario = usuarioService.create;
export const obtenerUsuarios = usuarioService.list;
