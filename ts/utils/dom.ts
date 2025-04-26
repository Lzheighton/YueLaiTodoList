import { ElementIdToType } from "../types/elements";

//工具函数，用于判定从DOM取得的元素是否为空，简化代码
//泛型升级，用于匹配不同类型的DOM元素（按钮，输入，选择等等）
export function $<T extends string>(id: T): ElementIdToType<T> {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element with id ${id} not found`);
    return el as ElementIdToType<T>;
}