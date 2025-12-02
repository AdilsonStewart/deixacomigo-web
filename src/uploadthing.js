// src/uploadthing.js
import { createUploadthing } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({
    video: {
      maxFileSize: "128MB",
      maxFileCount: 1,
    // só um vídeo por vez
    }
  })
  .middleware(() => {
    // aqui poderia validar token se quiser, mas não precisa agora
    return { userId: "guest" };
  })
  .onUploadComplete((data) => {
    console.log("upload concluído!", data);
  })
};

export const { POST } = createRouteHandler({ router: ourFileRouter });
