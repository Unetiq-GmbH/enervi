import shortService from "../app/services/shortService";
import { HousingConditionType } from "../app/database/shorts/shorts.types";
import { describe, expect } from "@jest/globals";

describe("sortByHousingConditionAndPostCode", () => {
  it("should sort by housingCondition if provided", () => {
    const shorts = [
      {
        image: {
          name: "Test image 1",
          blobName: "",
          blobUrl: "",
        },
        title: "Test Short 1",
        message: "Test short message 1",
        hyperlink: "",
        pin: null,
        housingCondition: "rented-flat" as HousingConditionType,
        postCode: "12345",
      },
      {
        image: {
          name: "Test image 2",
          blobName: "",
          blobUrl: "",
        },
        title: "Test Short 2",
        message: "Test short message 2",
        hyperlink: "",
        pin: null,
        housingCondition: "own-home" as HousingConditionType,
        postCode: "12345",
      },
      {
        image: {
          name: "Test image 3",
          blobName: "",
          blobUrl: "",
        },
        title: "Test Short 3",
        message: "Test short message 3",
        hyperlink: "",
        pin: null,
        housingCondition: "own-home" as HousingConditionType,
        postCode: "12345",
      },
    ];
    const sorted = shortService.sortByHousingConditionAndPostCode({
      shorts,
      housingCondition: "own-home",
    });
    expect(sorted[0].housingCondition).toBe("own-home");
    expect(sorted[1].housingCondition).toBe("own-home");
    expect(sorted[2].housingCondition).toBe("rented-flat");
  });

  it("should sort by postCode if provided", () => {
    const shorts = [
      {
        image: {
          name: "Test image 1",
          blobName: "",
          blobUrl: "",
        },
        title: "Test Short 1",
        message: "Test short message 1",
        hyperlink: "",
        pin: null,
        housingCondition: "own-home" as HousingConditionType,
        postCode: "12345",
      },
      {
        image: {
          name: "Test image 2",
          blobName: "",
          blobUrl: "",
        },
        title: "Test Short 2",
        message: "Test short message 2",
        hyperlink: "",
        pin: null,
        housingCondition: "own-home" as HousingConditionType,
        postCode: "23456",
      },
      {
        image: {
          name: "Test image 3",
          blobName: "",
          blobUrl: "",
        },
        title: "Test Short 3",
        message: "Test short message 3",
        hyperlink: "",
        pin: null,
        housingCondition: "own-home" as HousingConditionType,
        postCode: "34567",
      },
    ];
    const sorted = shortService.sortByHousingConditionAndPostCode({
      shorts,
      postCode: 23456,
    });
    expect(sorted[0].postCode).toBe("23456");
    expect(sorted[1].postCode).toBe("12345");
    expect(sorted[2].postCode).toBe("34567");
  });
});
