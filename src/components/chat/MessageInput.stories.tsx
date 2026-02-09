"use client";

import { useState } from "react";
import { MessageInput } from "./MessageInput";

interface MessageInputStoryArgs {
  initialValue?: string;
  disabled?: boolean;
}

function MessageInputStory({
  initialValue = "",
  disabled = false,
}: MessageInputStoryArgs) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <MessageInput
        value={value}
        onChange={setValue}
        onSend={async () => {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 400);
          });
        }}
        disabled={disabled}
      />
    </div>
  );
}

const meta = {
  title: "Chat/MessageInput",
  component: MessageInput,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Default = {
  render: () => <MessageInputStory initialValue="" />,
};

export const WithDraft = {
  render: () => (
    <MessageInputStory initialValue="帮我总结一下这段对话的关键点。" />
  ),
};

export const Disabled = {
  render: () => <MessageInputStory initialValue="正在生成中..." disabled />,
};
