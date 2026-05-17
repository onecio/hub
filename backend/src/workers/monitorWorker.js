// Fase 6: engine de monitoramento (checks HTTP, TLS, DNS, TCP)
// Por agora, apenas mantém o processo vivo para o container não reiniciar.
import { config } from '../config/index.js'; // valida env no boot

process.stdout.write(
  `[monitor-worker] iniciado — implementação completa na Fase 6 (NODE_ENV=${config.NODE_ENV})\n`
);

// Impede exit imediato; substituído por loop de checks na Fase 6
setInterval(() => {}, 60_000);
