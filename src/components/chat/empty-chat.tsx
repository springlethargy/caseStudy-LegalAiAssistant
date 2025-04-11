import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function EmptyChat() {
    return (
        <div className="flex flex-col items-center">
            <div className="mb-12 mt-4">
                <Image
                    src="/main_logo.png"
                    alt="UCASS Logo"
                    width={240}
                    height={240}
                    priority
                    className="mx-auto"
                />
            </div>

            <div className="w-full max-w-2xl bg-card rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">

                    <div className="flex-1">
                        <h3 className="text-xl font-medium mb-3">欢迎使用社问</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>这是一个关于中国社会科学院大学的智能问答助手</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>你可以询问关于学校课程、校园生活、教学资源等问题</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>请在下方输入框中输入你的问题</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 