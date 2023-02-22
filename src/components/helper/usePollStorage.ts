import dayjs from "dayjs";
import useLocalStorage from "uselocalstoragenextjs";

type Score = {
  criteria: string
  key: string
  score: number
}

type PollSummary = {
  scores: Score[]
  updated: string,
}


/*export const useLocalStorage = <T>(key: string, fallbackValue: T) => {
  const [value, setValue] = useState<T>(fallbackValue);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem(key);
    console.log({stored})
    if(initialized) return
    setValue(stored ? JSON.parse(stored) : fallbackValue);
    setInitialized(true)
  }, [initialized, fallbackValue, key, setValue, setInitialized]);

  useEffect(() => {
    if(!initialized) return
    console.log({key, value})
    localStorage.setItem(key, JSON.stringify(value));
  }, [initialized, key, value]);

  return [initialized, value, setValue] as const;
};*/
export const usePollStorage = () => {
  const {value: pollData, setLocalStorage: setPollData, load}  = useLocalStorage<PollSummary>(
      {
        name: 'poll',
        defaultValue: { scores: [], updated: dayjs(new Date()).format() },
        parse: value => JSON.parse(value ==  "" ? "{}" : value) as PollSummary
      });
  return {
    pollData,
    setPollData,
    initialized: load
  }
}
