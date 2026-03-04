let kafkaAvailable = false;
let kafka, producer, consumer;
let eventBroadcaster = null; // Will be set to socket.io emit function

// Only attempt Kafka connection if explicitly requested via environment variable
const KAFKA_ENABLED = !!process.env.KAFKA_BROKER;

try {
    if (KAFKA_ENABLED) {
        const { Kafka } = require('kafkajs');
        kafka = new Kafka({
            clientId: 'govtech-security',
            brokers: [process.env.KAFKA_BROKER],
            retry: { retries: 1 }
        });
        producer = kafka.producer();
        consumer = kafka.consumer({ groupId: 'security-dashboard-group' });
        kafkaAvailable = true;
    } else {
        kafkaAvailable = false;
    }
} catch {
    kafkaAvailable = false;
}

function setBroadcaster(fn) {
    eventBroadcaster = fn;
}

async function startKafkaConsumer() {
    if (!kafkaAvailable) {
        console.log('[Kafka] kafkajs not available — using internal event bus');
        return false;
    }
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'security-events', fromBeginning: false });
        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                const event = JSON.parse(message.value.toString());
                console.log('[Kafka] Event received:', event.type);
                if (eventBroadcaster) eventBroadcaster('security_event', event);
            }
        });
        console.log('[Kafka] Consumer connected on localhost:9092');
        return true;
    } catch (e) {
        console.warn('[Kafka] Could not connect — broker may not be running:', e.message);
        return false;
    }
}

async function publishEvent(event) {
    if (!kafkaAvailable || !producer) {
        // Direct broadcast if Kafka not running
        if (eventBroadcaster) eventBroadcaster('security_event', event);
        return;
    }
    try {
        await producer.connect();
        await producer.send({
            topic: 'security-events',
            messages: [{ value: JSON.stringify(event) }]
        });
    } catch {
        if (eventBroadcaster) eventBroadcaster('security_event', event);
    }
}

module.exports = { startKafkaConsumer, publishEvent, setBroadcaster };
