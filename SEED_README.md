# Poblar Base de Datos con Datos de Ejemplo

Para poblar la base de datos con datos de ejemplo durante desarrollo:

```bash
# Asegúrate de que el backend esté ejecutándose
npm run dev

# En otra terminal, ejecuta:
curl -X POST http://localhost:4000/api/seed
```

Esto insertará datos de ejemplo en las siguientes tablas:
- ✅ Academias (3 academias)
- ✅ Estados (4 estados)
- ✅ Asignaturas (5 asignaturas)
- ✅ Cursos (6 cursos)
- ✅ Temas (6 temas)
- ✅ Usuarios (4 usuarios)
- ✅ Encargos (4 encargos)

Los datos son seguros de insertar múltiples veces gracias a `ON CONFLICT DO NOTHING`.

## Usuarios de Ejemplo

- **admin**: admin@academia.com (Admin)
- **profesor1**: profesor1@academia.com (Profesor)
- **profesor2**: profesor2@academia.com (Profesor)
- **estudiante1**: estudiante1@academia.com (Estudiante)

## Encargos de Ejemplo

1. **Encargo Matemáticas Básicas** - Academia Primaria, profesor1
2. **Encargo Lenguaje Avanzado** - Academia Primaria, profesor1  
3. **Encargo Ciencias Naturales** - Academia Secundaria, profesor2
4. **Encargo Historia Antigua** - Academia Secundaria, profesor2

## Verificar Datos

```bash
curl http://localhost:4000/api/academias  # Debería mostrar 3 academias
curl http://localhost:4000/api/users     # Debería mostrar 4 usuarios
curl http://localhost:4000/api/cursos    # Debería mostrar 6 cursos
curl http://localhost:4000/api/asignaturas # Debería mostrar 5 asignaturas
curl http://localhost:4000/api/temas     # Debería mostrar 6 temas
curl http://localhost:4000/api/estados   # Debería mostrar 4 estados
curl http://localhost:4000/api/encargos  # Debería mostrar 4 encargos
