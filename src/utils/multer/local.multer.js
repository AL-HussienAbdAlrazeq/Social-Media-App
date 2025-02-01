import path from "node:path";
import fs from "node:fs";
import multer from "multer";

export const fileTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    document: ['application/pdf', 'application/msword']
};

export const uploadDiskFile = (customPath = 'general', fileValidation = []) => {
    const basePath = `uploads/${customPath}`;
    const fullPath = path.resolve(`./src/${basePath}`);

    // Ensure directory exists before uploading
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, fullPath); // ✅ Fixed: Use fullPath instead of "uploads"
        },
        filename: (req, file, cb) => {
            const fullFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
            file.finalPath = basePath+"/"+fullFileName // ✅ Fixed: Ensures proper file path
            cb(null, fullFileName);
        }
    });

    function fileFilter(req, file, cb) {
        if (fileValidation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid Format"), false);
        }
    }

    return multer({ storage, fileFilter });
};
