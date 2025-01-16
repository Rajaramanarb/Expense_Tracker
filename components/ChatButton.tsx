"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Chat } from "./Chat";

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px] h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader>
            <DialogTitle className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Expense Assistant
              </div>
            </DialogTitle>
          </DialogHeader>
          <Chat />
        </DialogContent>
      </Dialog>
    </>
  );
}
