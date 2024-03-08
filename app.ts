const express = require("express");
import { Express, Request, Response } from "express";
import console = require("console");
const cors = require("cors");
const data = require("./data/data");
const axios = require("axios");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
type FilterClauseType = {
  id: string;
  condition: "equals" | "does_not_equal" | "greater_than" | "less_than";
  value: number | string;
};
type Questions = {
  id: string;
  name: string;
  type: string;
  value: string | number;
};
type FormResponse = {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  questions: Questions[];
  calculations: string[];
  urlParameters: string[];
  quiz: string[];
  documents: [];
};

type ResponseFilterType = FilterClauseType[];

const filter: ResponseFilterType = [
  { id: "sample_id", condition: "equals", value: "sample_value" }
];

// console.log(filter);
// console.log(JSON.stringify(filter));

function chooseOperator(filter: FilterClauseType, question: Questions) {
  switch (filter.condition) {
    case "equals":
      return filter.value == question.value;
    case "does_not_equal":
      return filter.value != question.value;
    case "greater_than":
      return question.value > filter.value;
    case "less_than":
      return question.value < filter.value;
    default:
      return false;
  }
}

function doesFilterMatch(filter: FilterClauseType, questions: Questions[]) {
  for (const question of questions) {
    if (filter.id == question.id && chooseOperator(filter, question)) {
      return true;
    }
  }
  return false;
}

app.get("/:formId/filteredResponses", async (req: Request, res: Response) => {
  console.log(`/formId/filteredResponses`);
  const formResponses: FormResponse[] = await fetchData(req.params.formId);
  const filters: ResponseFilterType = JSON.parse(req.query.filters as string);
  let filterIndex = 0;
  const filterLength = filters.length;
  let responsesToFilter = formResponses;
  let filteredData: FormResponse[] = [];

  while (filterIndex < filterLength) {
    filteredData = responsesToFilter.filter((submission: FormResponse) => {
      return doesFilterMatch(filters[filterIndex], submission.questions);
    });
    filterIndex++;
    responsesToFilter = filteredData;
  }
  const responseBody = Object.assign(
    { responses: filteredData },
    {
      totalResponses: filteredData.length,
      pageCount: Math.ceil(filteredData.length / 150)
    }
  );
  res.send(responseBody);
});

async function fetchData(formId: string) {
  const token =
    "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const data = await axios.get(
    `https://api.fillout.com/v1/api/forms/${formId}/submissions`,
    config
  );
  return data.data.responses;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
