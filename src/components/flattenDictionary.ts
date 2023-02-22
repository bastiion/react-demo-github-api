export type Criteria = {
  name: string
  path: string[]
}

export type CriteriaWithId = Criteria & {
  id: string
}

export type CriteriaWithIdAndScores = CriteriaWithId & {
  [key: string]: any
}

export const flattenDictionary = (dict: any, path: string[] = []) => {
  let items: Criteria[] = [];
  for (let key in dict) {
    const currentElement =  {name: key, path: [...path, key]}
    if (dict[key] === null) {
      items.push(currentElement);
    } else {
      items = [...items, currentElement, ...flattenDictionary(dict[key], [...path, key])];
    }
  }
  return items;
};
