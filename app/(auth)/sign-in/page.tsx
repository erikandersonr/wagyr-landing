"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="mb-6">
                <Link href="/">
                    <Image src="/logo.png" alt="Wagyr" width={140} height={140} />
                </Link>
            </div>
            <Card className="w-full max-w-md bg-transparent border-1 rounded-sm border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Input className="border-white/10 bg-transparent text-white rounded-sm h-9" placeholder="Email" type="email" />
                        <Button variant="secondary" className="w-full rounded-sm" size="lg">
                            <div className="flex items-center gap-2">
                                <span>Sign In</span>
                                <ArrowRight size={4} />
                            </div>
                        </Button>
                        <Separator className=" bg-white/10" />
                        <Button variant="secondary" className="h-9 w-full rounded-sm bg-[#28CC95] hover:bg-[#28CC95]/80">
                            <div className="flex items-center gap-2">
                                <span>Continue with Kalshi</span>
                            </div>
                        </Button>
                    </div>
                </CardContent>

            </Card>
        </div>
    )
}