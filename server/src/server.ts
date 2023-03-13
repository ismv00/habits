
import Fastify from "fastify";
import cors from '@fastify/cors';
import { appRoutes } from "./routes";


const app = Fastify();

app.register(cors) //configurar o acesso a outras aplicações.

app.register(appRoutes);

app.listen({
    port: 3333
}).then(() => {
    console.log("http server running")
})