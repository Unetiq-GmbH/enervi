import { ShortModel } from "../database/shorts/shorts.model";
import { IShortDocument, IShort } from "../database/shorts/shorts.types";

interface SortParams {
  shorts: IShort[] | IShortDocument[];
  housingCondition?: string;
  postCode?: number;
}

const sortByHousingConditionAndPostCode = ({
  shorts,
  housingCondition,
  postCode,
}: SortParams) => {
  const postCodeDifferences = shorts.map((short) => {
    const postCodeDifference =
      short.postCode && postCode
        ? Math.abs(parseInt(short.postCode) - postCode)
        : null;

    const shortData =
      short instanceof ShortModel ? short.toObject() : { ...short };
    return {
      ...shortData,
      postCodeDifference: postCodeDifference,
    };
  });

  return postCodeDifferences.sort((a, b) => {
    if (housingCondition) {
      if (
        a.housingCondition === housingCondition &&
        b.housingCondition !== housingCondition
      ) {
        return -1;
      }
      if (
        a.housingCondition !== housingCondition &&
        b.housingCondition === housingCondition
      ) {
        return 1;
      }
    }

    if (postCode) {
      if (a.postCodeDifference !== b.postCodeDifference) {
        if (a.postCodeDifference === null) return 1;
        if (b.postCodeDifference === null) return -1;
        return a.postCodeDifference - b.postCodeDifference;
      }
    }

    // If housingCondition is not provided or postCode sorting is equal, maintain original order
    return 0;
  });
};

export default { sortByHousingConditionAndPostCode };
