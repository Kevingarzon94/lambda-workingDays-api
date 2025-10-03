# Working Days API - Colombia 🇨🇴

API REST para calcular fechas y horas hábiles en Colombia, considerando días festivos nacionales y horarios laborales estándar.

## 📋 Descripción

Esta API calcula fechas laborales futuras sumando días y/o horas hábiles a partir de una fecha inicial, respetando:
- **Horario laboral**: Lunes a Viernes, 8:00 AM - 5:00 PM (hora Colombia)
- **Hora de almuerzo**: 12:00 PM - 1:00 PM
- **Días festivos colombianos**: Excluidos automáticamente
- **Zona horaria**: America/Bogota (UTC-5)

## 🚀 Demo

**URL de la API desplegada**: ` https://o6vmfqdmvb.execute-api.us-east-1.amazonaws.com/prod/working-days`

### Ejemplos de uso:

```bash
# Sumar 3 horas desde el momento actual
curl " https://o6vmfqdmvb.execute-api.us-east-1.amazonaws.com/prod/working-days?hours=3"

# Sumar 2 días y 4 horas
curl " https://o6vmfqdmvb.execute-api.us-east-1.amazonaws.com/prod/working-days?days=2&hours=4"

# Usar fecha específica como punto de partida
curl " https://o6vmfqdmvb.execute-api.us-east-1.amazonaws.com/prod/working-days?date=2025-04-10T15:00:00Z&days=5&hours=4"
```

## 🛠️ Tecnologías

- **TypeScript**: Tipado estático para mayor robustez
- **AWS Lambda**: Función serverless para el cálculo
- **API Gateway**: Endpoint REST
- **AWS CDK**: Infrastructure as Code
- **Node.js 18.x**: Runtime de ejecución
- **date-fns-tz**: Manejo de zonas horarias

## 📦 Instalación Local

### Prerequisitos

- Node.js 18.x o superior
- npm o yarn
- AWS CLI configurado (para deploy)
- AWS CDK CLI

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Kevingarzon94/lambda-workingDays-api
cd working-days-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Compilar TypeScript**
```bash
npm run build
```

4. **Ejecutar pruebas locales**
```bash
npm test
```

## 🧪 Pruebas Locales

### Ejecutar suite de pruebas
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con ejemplos del enunciado
npx ts-node test/test-examples.ts
```

### Probar handler directamente
```typescript
// test/local-test.ts
import { handler } from '../lib/lambda/handlers/workingDays';

const event = {
  queryStringParameters: {
    days: "1",
    hours: "2"
  }
};

const result = await handler(event);
console.log(JSON.parse(result.body));
```

## 🚀 Deploy a AWS

### 1. Configurar credenciales AWS
```bash
aws configure
# Ingresa tu Access Key ID y Secret Access Key
```

### 2. Bootstrap CDK (primera vez)
```bash
cdk bootstrap
```

### 3. Deploy
```bash
cdk deploy
```

Al finalizar, obtendrás la URL de tu API:
```
Outputs:
WorkingDaysApiStack.ApiEndpoint = https://xxxxx.execute-api.region.amazonaws.com/prod/working-days
```

### 4. Verificar deployment
```bash
# Probar endpoint desplegado
curl " https://o6vmfqdmvb.execute-api.us-east-1.amazonaws.com/prod/working-days?hours=1"
```

## 📖 API Reference

### Endpoint
```
GET /working-days
```

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `days` | integer | No* | Número de días hábiles a sumar |
| `hours` | integer | No* | Número de horas hábiles a sumar |
| `date` | string (ISO 8601) | No | Fecha/hora inicial en UTC. Si no se provee, usa la hora actual |

*Al menos uno de `days` o `hours` debe estar presente

### Response

#### Success (200 OK)
```json
{
  "date": "2025-08-01T14:00:00.000Z"
}
```

#### Error (400 Bad Request)
```json
{
  "error": "InvalidParameters",
  "message": "At least one of 'days' or 'hours' parameters is required"
}
```

## 📝 Reglas de Negocio

### Horario Laboral
- **Días hábiles**: Lunes a Viernes
- **Horario**: 8:00 AM - 5:00 PM (Colombia)
- **Almuerzo**: 12:00 PM - 1:00 PM (no cuenta como hora laboral)
- **Horas laborales por día**: 8 horas efectivas

### Ajuste de Fecha Inicial
Si la fecha inicial cae fuera del horario laboral:
- **Fin de semana o festivo**: Se ajusta al siguiente día hábil a las 8:00 AM
- **Antes de 8:00 AM**: Se ajusta a las 8:00 AM del mismo día
- **Después de 5:00 PM**: Se ajusta al siguiente día hábil a las 8:00 AM
- **Hora de almuerzo**: Se ajusta a la 1:00 PM

### Cálculo
1. Primero se suman los días hábiles (si aplica)
2. Luego se suman las horas hábiles (si aplica)
3. El resultado se retorna en UTC

## 🏗️ Estructura del Proyecto

```
working-days-api/
├── lib/
│   ├── lambda/
│   │   ├── handlers/
│   │   │   └── workingDays.ts      # Handler principal
│   │   ├── services/
│   │   │   ├── dateCalculator.ts   # Lógica de cálculo
│   │   │   └── holidayService.ts   # Manejo de festivos
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── utils/
│   │       └── validators.ts       # Validación de parámetros
│   └── working-days-api-stack.ts   # Infraestructura CDK
├── test/
│   ├── test-examples.ts            # Pruebas con ejemplos
│   └── local-test.ts               # Pruebas locales
├── bin/
│   └── working-days-api.ts        # Entry point CDK
├── cdk.json                        # Configuración CDK
├── tsconfig.json                   # Configuración TypeScript
├── package.json
└── README.md
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Viernes 5PM + 1 hora
```bash
curl "API_URL?date=2025-01-10T22:00:00Z&hours=1"
# Resultado: Lunes 9:00 AM Colombia (2025-01-13T14:00:00Z)
```

### Ejemplo 2: Día laboral + 8 horas
```bash
curl "API_URL?date=2025-01-13T13:00:00Z&hours=8"
# Resultado: Mismo día 5:00 PM Colombia (2025-01-13T22:00:00Z)
```

### Ejemplo 3: Con festivos
```bash
curl "API_URL?date=2025-04-10T15:00:00Z&days=5&hours=4"
# Si 17-18 abril son festivos
# Resultado: 21 abril 3:00 PM Colombia (2025-04-21T20:00:00Z)
```

## 🔧 Configuración

### Variables de Entorno
La Lambda se ejecuta con las siguientes configuraciones:
- **Runtime**: Node.js 18.x
- **Memory**: 256 MB
- **Timeout**: 30 segundos

### Festivos
Los días festivos se obtienen dinámicamente de:
```
https://content.capta.co/Recruitment/WorkingDays.json
```

## 📊 Decisiones Técnicas

### Zona Horaria
- Todos los cálculos internos se realizan en UTC
- Las constantes de horario están ajustadas a UTC (ej: 8AM Colombia = 13:00 UTC)
- Esto garantiza consistencia independiente del servidor de ejecución

### Optimizaciones
- Los festivos se cachean en memoria después de la primera consulta
- Para sumas de muchas horas, se convierten a días completos + horas restantes
- Uso de `setUTC*` methods para evitar problemas de DST

### Notas de Implementación
Se detectó una inconsistencia en el enunciado original sobre el ajuste "hacia atrás" vs los ejemplos que muestran ajuste hacia adelante. Se optó por seguir los ejemplos proporcionados, ajustando siempre hacia el siguiente momento laboral válido.

## 🧹 Limpieza

Para eliminar todos los recursos de AWS:
```bash
cdk destroy
```

## 👥 Autor

[Kevin Garzon]
- GitHub: [@Kevingarzon94](https://github.com/Kevingarzon94)
- Email: kevingarzon4@gmail.com
