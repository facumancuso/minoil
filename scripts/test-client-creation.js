/**
 * Script de prueba para verificar la creación de clientes
 * Ejecutar: node scripts/test-client-creation.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing client creation...');
console.log('📍 MongoDB URI:', MONGODB_URI ? 'Configured' : 'NOT CONFIGURED');

// Definir el schema de Client
const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

async function testClientCreation() {
  try {
    console.log('\n1️⃣ Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB exitosamente');

    const ClientModel = mongoose.model('Client', ClientSchema);

    // Intentar crear un cliente de prueba
    console.log('\n2️⃣ Creando cliente de prueba...');
    const testClient = {
      name: 'Cliente de Prueba',
      contactPerson: 'Juan Pérez',
      email: 'test@example.com',
      phone: '+1234567890',
    };

    console.log('📝 Datos del cliente:', testClient);

    const savedClient = await ClientModel.create(testClient);
    console.log('✅ Cliente creado exitosamente con ID:', savedClient._id.toString());

    // Verificar que se guardó
    console.log('\n3️⃣ Verificando que el cliente existe en la BD...');
    const foundClient = await ClientModel.findById(savedClient._id);

    if (foundClient) {
      console.log('✅ Cliente encontrado en la base de datos:');
      console.log('   - Nombre:', foundClient.name);
      console.log('   - Contacto:', foundClient.contactPerson);
      console.log('   - Email:', foundClient.email);
      console.log('   - Teléfono:', foundClient.phone);
    } else {
      console.log('❌ ERROR: Cliente no encontrado después de crearlo');
    }

    // Contar todos los clientes
    console.log('\n4️⃣ Contando total de clientes en la BD...');
    const totalClients = await ClientModel.countDocuments();
    console.log('📊 Total de clientes en la base de datos:', totalClients);

    // Listar todos los clientes
    console.log('\n5️⃣ Listando todos los clientes:');
    const allClients = await ClientModel.find({}).limit(10);
    allClients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.name} (${client.email})`);
    });

    // Limpiar - eliminar el cliente de prueba
    console.log('\n6️⃣ Limpiando: eliminando cliente de prueba...');
    await ClientModel.findByIdAndDelete(savedClient._id);
    console.log('✅ Cliente de prueba eliminado');

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📝 CONCLUSIÓN: La creación de clientes funciona correctamente.');
    console.log('   Si los clientes no se guardan desde la interfaz web,');
    console.log('   el problema probablemente está en:');
    console.log('   - El formulario de la interfaz');
    console.log('   - La función addOrUpdateClientAction');
    console.log('   - Los backups automáticos bloqueando la operación');

  } catch (error) {
    console.error('\n❌ ERROR durante las pruebas:', error.message);
    console.error('\n📋 Detalles del error:', error);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  MongoDB no está ejecutándose.');
      console.error('   Inicia MongoDB con: mongod o net start MongoDB');
    } else if (error.message.includes('required')) {
      console.error('\n⚠️  Faltan campos requeridos en el cliente');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

if (!MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI no está configurado en .env.local');
  console.error('   Agrega: MONGODB_URI=mongodb://localhost:27017/minoil_db');
  process.exit(1);
}

testClientCreation();
