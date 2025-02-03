import { pipeline } from "@xenova/transformers";
import { useState } from "react";

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");

  const translate = async () => {
    try {
      const translator = await pipeline("translation", "Helsinki-NLP/opus-mt-en-fr");
      const result = await translator(inputText);

      // Log the result to inspect the structure
      console.log(result);

      // Check the structure of the result and use the correct property
      if (Array.isArray(result) && result[0]?.translation) {
        setTranslatedText(result[0].translation);  // Use the correct key (translation)
      } else {
        setTranslatedText("Translation failed.");
      }
    } catch (error) {
      setTranslatedText("Error in translation.");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text..."
      />
      <button onClick={translate}>Translate</button>
      <p>Translated: {translatedText}</p>
    </div>
  );
};

export default Translator;
