import bcrypt from "bcrypt";

class PasswordHash {
    public static hash = (password: string): Promise<string> => {
        return bcrypt.hash(password, 10);
    }

    public static checkHash = (password: string, passwordHash: string): Promise<boolean> => {
        return bcrypt.compare(password, passwordHash);
    }   
}

export default PasswordHash;