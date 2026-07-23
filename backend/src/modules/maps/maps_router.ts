  import { FastifyInstance } from "fastify";
  import { createMapController } from "./maps_controller";

  const prefix = "/maps";

  export async function MapRoutes(app: FastifyInstance) {
  
    app.register(async (routes) => {
    
      routes.post("/", createMapController);
      
      
      
    }, { prefix });
    
    
    
    
  }
