import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export const UPLOADS_DIRECTORY = path.resolve(process.cwd(), 'uploads');
export const AVATARS_DIRECTORY = path.join(UPLOADS_DIRECTORY, 'avatars');

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const allowedImageTypes: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

mkdirSync(AVATARS_DIRECTORY, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, AVATARS_DIRECTORY);
  },
  filename: (request, file, callback) => {
    const extension = extensionByMimeType[file.mimetype];
    callback(null, `avatar-${request.user!.id}-${randomUUID()}${extension}`);
  },
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
  fileFilter: (_request, file, callback) => {
    const originalExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = allowedImageTypes[file.mimetype];

    if (!allowedExtensions || !allowedExtensions.includes(originalExtension)) {
      callback(new Error('Envie uma imagem JPEG, PNG ou WebP válida.'));
      return;
    }

    callback(null, true);
  },
});

async function hasValidImageSignature(file: Express.Multer.File) {
  const contents = await readFile(file.path);

  if (file.mimetype === 'image/jpeg') {
    return contents.length >= 3 && contents[0] === 0xff && contents[1] === 0xd8 && contents[2] === 0xff;
  }

  if (file.mimetype === 'image/png') {
    return (
      contents.length >= 8 &&
      contents.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }

  return (
    contents.length >= 12 &&
    contents.subarray(0, 4).toString('ascii') === 'RIFF' &&
    contents.subarray(8, 12).toString('ascii') === 'WEBP'
  );
}

async function removeUploadedFile(file: Express.Multer.File) {
  try {
    await unlink(file.path);
  } catch {
    // The file is only temporary until the controller persists its public URL.
  }
}

export function uploadAvatar(request: Request, response: Response, next: NextFunction) {
  avatarUpload.single('avatar')(request, response, (error: unknown) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return response.status(400).json({ message: 'A imagem deve ter no máximo 2 MB.' });
      }

      if (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE') {
        return response.status(400).json({ message: 'Envie o arquivo usando o campo avatar.' });
      }

      return response.status(400).json({ message: 'Envie uma imagem JPEG, PNG ou WebP válida.' });
    }

    if (!request.file) {
      return next();
    }

    void hasValidImageSignature(request.file)
      .then(async (isValid) => {
        if (isValid) {
          return next();
        }

        await removeUploadedFile(request.file!);
        return response.status(400).json({ message: 'Envie uma imagem JPEG, PNG ou WebP válida.' });
      })
      .catch(async () => {
        await removeUploadedFile(request.file!);
        return response.status(400).json({ message: 'Não foi possível validar a imagem enviada.' });
      });
  });
}
