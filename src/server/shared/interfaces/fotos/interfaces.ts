export interface IFile {
    path: string
    filename: string
    originalname: string
    mimetype: string
    size: number
    nuvem: boolean,
    tipo_foto: 'postagens' | 'usuarios'
    width?: number,
    height?: number
}