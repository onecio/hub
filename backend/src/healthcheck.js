// Probe de saúde via Node.js nativo — sem dependências externas.
// Necessário no container distroless (sem wget/curl).
const res = await fetch('http://localhost:3000/health').catch(() => null);
process.exit(res?.ok ? 0 : 1);
