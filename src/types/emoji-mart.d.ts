declare module "@emoji-mart/react" {
  interface EmojiMartProps {
    data?: any;
    onEmojiSelect?: (emoji: { native: string }) => void;
    theme?: "light" | "dark";
    skinTonePosition?: "none" | "preview" | "search";
    emojiButtonSize?: number;
    emojiSize?: number;
    maxFrequentRows?: number;
  }

  const Picker: React.FC<EmojiMartProps>;
  export default Picker;
}

declare module "@emoji-mart/data" {
  const data: any;
  export default data;
}
