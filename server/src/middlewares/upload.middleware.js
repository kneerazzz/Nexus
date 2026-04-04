import multer from "multer";

const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]

    if(allowed.includes(file.mimetype)){
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX and TXT files are allowed!'), false)
    }
};

export const uploadDocument = multer({
    storage,
    fileFilter, 
    limits:  { fileSize: 10 * 1024 * 1024 } //10MB MAX
});


export const uploadImage = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if(file.mimetype.startsWith('image/')){
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false)
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } //5MB max
})

