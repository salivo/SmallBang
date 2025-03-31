import { useState } from "react";

export default function useMutation(
  fn: (...args: any[]) => any,
  onSucces: () => void = () => {},
  onError: () => void = () => {},
) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const mutate = async (...args: any[]) => {
    setIsLoading(true);
    try {
      const result = await fn(...args);
      if (result) {
        onSucces();
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      setIsError(true);
      setError(err.message);
    }
  };
  return { mutate, isLoading, isError, error };
}
