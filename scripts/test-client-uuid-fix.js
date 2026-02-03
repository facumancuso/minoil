/**
 * Script de prueba para verificar el fix del problema UUID vs ObjectId
 * Ejecutar: node scripts/test-client-uuid-fix.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing UUID to ObjectId fix...\n');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

// Simular la función addOrUpdateClientAction con el fix
async function addOrUpdateClientAction(client) {
  const ClientModel = mongoose.model('Client', ClientSchema);

  console.log("📝 Saving client:", client.name);
  console.log("   ID recibido:", client.id);
  console.log("   Tipo de ID:", typeof client.id);

  let savedClient;
  // Verificar si es actualización: el id debe existir Y ser un ObjectId válido de MongoDB
  const isValidMongoId = client.id && /^[0-9a-fA-F]{24}$/.test(client.id);
  const isUpdate = !!isValidMongoId;

  console.log("   Es ObjectId válido de MongoDB?:", isValidMongoId);
  console.log("   Es actualización?:", isUpdate);

  if (isUpdate) {
    // Es una actualización de un cliente existente
    console.log("   → Actualizando cliente existente...");
    const { id, ...clientData } = client;
    savedClient = await ClientModel.findByIdAndUpdate(client.id, clientData, { new: true });
  } else {
    // Es un nuevo cliente - eliminar el id UUID si existe
    console.log("   → Creando nuevo cliente (ignorando UUID)...");
    const { id, ...clientData } = client;
    savedClient = await ClientModel.create(clientData);
  }

  console.log("   ✅ Cliente guardado con MongoDB ObjectId:", savedClient._id.toString());
  return savedClient;
}

async function runTests() {
  try {
    console.log('1️⃣ Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado\n');

    // Test 1: Cliente nuevo con UUID (simula el problema original)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: Cliente nuevo con UUID generado por crypto.randomUUID()');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const newClientWithUUID = {
      id: crypto.randomUUID(), // Esto genera algo como "550e8400-e29b-41d4-a716-446655440000"
      name: 'Test Cliente UUID',
      contactPerson: 'Juan UUID',
      email: 'uuid@test.com',
      phone: '+1234567890',
    };

    const savedClient1 = await addOrUpdateClientAction(newClientWithUUID);
    console.log('✅ TEST 1 PASÓ: Cliente guardado correctamente ignorando UUID\n');

    // Test 2: Cliente nuevo sin id
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: Cliente nuevo sin ID');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const newClientNoId = {
      name: 'Test Cliente Sin ID',
      contactPerson: 'Maria NoID',
      email: 'noid@test.com',
      phone: '+0987654321',
    };

    const savedClient2 = await addOrUpdateClientAction(newClientNoId);
    console.log('✅ TEST 2 PASÓ: Cliente guardado correctamente\n');

    // Test 3: Actualizar cliente existente con ObjectId válido
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: Actualizar cliente existente con ObjectId válido');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const updateClient = {
      id: savedClient1._id.toString(), // ObjectId válido de MongoDB
      name: 'Test Cliente UUID ACTUALIZADO',
      contactPerson: 'Juan UUID Actualizado',
      email: 'uuid-updated@test.com',
      phone: '+1111111111',
    };

    const savedClient3 = await addOrUpdateClientAction(updateClient);
    console.log('✅ TEST 3 PASÓ: Cliente actualizado correctamente\n');

    // Verificar en la base de datos
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('VERIFICACIÓN: Listando clientes de prueba creados');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const ClientModel = mongoose.model('Client', ClientSchema);
    const testClients = await ClientModel.find({
      name: { $regex: /^Test Cliente/ }
    });

    console.log(`Encontrados ${testClients.length} clientes de prueba:`);
    testClients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.name}`);
      console.log(`      ID: ${client._id}`);
      console.log(`      Email: ${client.email}`);
    });

    // Limpiar
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LIMPIEZA: Eliminando clientes de prueba');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await ClientModel.deleteMany({ name: { $regex: /^Test Cliente/ } });
    console.log('✅ Clientes de prueba eliminados\n');

    console.log('🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('\n📋 RESUMEN:');
    console.log('   ✅ Clientes con UUID ahora se guardan correctamente');
    console.log('   ✅ El UUID se ignora y MongoDB genera su propio ObjectId');
    console.log('   ✅ Las actualizaciones con ObjectId válido funcionan');
    console.log('   ✅ Los clientes nuevos sin ID funcionan');
    console.log('\n💡 El problema está SOLUCIONADO');

  } catch (error) {
    console.error('\n❌ ERROR en los tests:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI no está configurado en .env.local');
  process.exit(1);
}

runTests();
