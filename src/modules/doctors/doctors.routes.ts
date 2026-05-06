import type { FastifyInstance } from "fastify";
import { DoctorsController } from "./doctors.controller.js";
import { authenticate } from "@/shared/middlewares/authenticate.js";
import { authorize } from "@/shared/middlewares/authorize.js";

const doctorsController = new DoctorsController()

export async function doctorsRoutes(app:  FastifyInstance) {
    app.get('/doctors', doctorsController.listDoctors.bind(doctorsController))
app.get<{ Params: { id: string } }>('/doctors/:id', doctorsController.getProfile.bind(doctorsController))
    
    app.post(
  '/doctors/profile',
  { preHandler: [authenticate, authorize('DOCTOR')] },
  doctorsController.createProfile.bind(doctorsController)
)

app.patch(
    '/doctors/profile',
    { preHandler: [authenticate, authorize('DOCTOR')] },
    doctorsController.updateProfile.bind(doctorsController)
)
}