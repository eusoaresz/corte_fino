import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

import routesBarbeiros from "./routes/barbeiros";
import routesServicos from "./routes/servicos";
import routesDisponibilidade from "./routes/disponibilidade";
import routesBloqueios from "./routes/bloqueios";
import routesAgendamentos from "./routes/agendamentos";
import routesUsuarios from "./routes/usuarios";

app.use(cors());
app.use(express.json());

app.use("/barbeiros", routesBarbeiros);
app.use("/servicos", routesServicos);
app.use("/disponibilidades", routesDisponibilidade);
app.use("/bloqueios", routesBloqueios);
app.use("/agendamentos", routesAgendamentos);
app.use("/usuarios", routesUsuarios);

app.get("/", (req, res) => {
  res.send("API: Barbearia Corte Fino");
});

app.listen(port, () => {
  console.log(`Servidor Rodando na Porta: ${port}`);
});
