import { AsyncLocalStorage } from "async_hooks";
import { AccessTokenPayload } from "../core/types/jwt.type";

export type UserContext = AccessTokenPayload;

const storage = new AsyncLocalStorage<UserContext>();

/**
 * Bọc logic trong một context người dùng.
 * @param user Thông tin người dùng từ token.
 * @param next Hàm callback chứa logic xử lý tiếp theo (middleware hoặc controller).
 */
export const runWithUser = (user: UserContext, next: () => void) => {
    storage.run(user, next);
};

/**
 * Lấy thông tin người dùng hiện tại từ context.
 * @returns UserContext hoặc undefined nếu không nằm trong request được xác thực.
 */
export const getUserContext = (): UserContext | undefined => {
    return storage.getStore();
};
