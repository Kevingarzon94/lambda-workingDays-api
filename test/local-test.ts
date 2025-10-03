import { handler } from '../lib/lambda/handlers/workingDays';
import { APIGatewayProxyEvent } from 'aws-lambda';

async function testLocal() {
  const event1: Partial<APIGatewayProxyEvent> = {
    queryStringParameters: {
      hours: "3"
    }
  };

  console.log('📅 Test: 3 horas desde ahora');
  console.log('Hora actual Colombia:', new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }));
  console.log('Hora actual UTC:', new Date().toISOString());

  const result = await handler(event1 as APIGatewayProxyEvent);
  const body = JSON.parse(result.body);

  console.log('Resultado UTC:', body.date);
  console.log('Resultado Colombia:', new Date(body.date).toLocaleString('es-CO', { timeZone: 'America/Bogota' }));

  const event2: Partial<APIGatewayProxyEvent> = {
    queryStringParameters: {
      days: "1",
      hours: "2"
    }
  };

  console.log('\nTest 2 - 1 día y 2 horas:');
  const result2 = await handler(event2 as APIGatewayProxyEvent);
  console.log(JSON.parse(result2.body));

  const event3: Partial<APIGatewayProxyEvent> = {
    queryStringParameters: {
      date: "2025-01-10T22:00:00Z", // Viernes 5PM Colombia
      hours: "1"
    }
  };

  console.log('\nTest 3 - Ejemplo 9 del enunciado:');
  const result3 = await handler(event3 as APIGatewayProxyEvent);
  console.log(JSON.parse(result3.body));

  const event4: Partial<APIGatewayProxyEvent> = {
    queryStringParameters: {}
  };

  console.log('\nTest 4 - Error esperado:');
  const result4 = await handler(event4 as APIGatewayProxyEvent);
  console.log(JSON.parse(result4.body));
}

testLocal().catch(console.error);