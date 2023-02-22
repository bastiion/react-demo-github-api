import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import useGitHubStore from "@/components/hooks/useGitHubStore";
import {useGitHubCommitPersistor} from "@/components/hooks/useGitHubCommitPersistor";
import {JSONSchema7} from "json-schema";
import {JsonForms} from "@jsonforms/react";
import {materialCells, materialRenderers} from "@jsonforms/material-renderers";
import {Button, Container} from "@mui/material";
import {Layout, UISchemaElement} from "@jsonforms/core";
import {GitHub} from "@mui/icons-material";
import {usePollStorage} from "@/components/helper/usePollStorage";

interface OwnProps {}

type Props = OwnProps;

const schema: JSONSchema7 = {
  "$id": "https://bastiion.github.io/decision-next-18/commit.schema.json",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "email": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "email",
  ],
}
const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: 'Control',
      scope: "#/properties/message",
      options: {
        multi: true
      }
    },
    {
      type: 'Control',
      scope: "#/properties/name"
    },
    {
      type: 'Control',
      scope: "#/properties/email"
    }
  ]
}

type CommitData = {
  name: string,
  message: string,
  email: string
}

const CompareAndCommit: FunctionComponent<Props> = (props) => {
  const { userEmails } = useGitHubStore()
  const { pollData } = usePollStorage()
  const [commitData, setCommitData] = useState<CommitData>({name: "", email: "", message: "Bewertung abgegeben"});
  const [mySchema, setMySchema] = useState(schema);
  const { commit } = useGitHubCommitPersistor({
    repo: 'decision-adb-test',
    owner: "bastiion",
    filePath: 'adb-next-vs-typo3-decision-matrix.json'
  })


  useEffect(() => {
    setMySchema({
      ...schema,
      properties: {
        ...schema.properties,
        email: {
          // @ts-ignore
          ...(schema.properties.email || {}),
          ...(userEmails.length > 0 ? {enum: userEmails.map(({email}) => email) } : {})
        }
      }
    })

  }, [userEmails, setMySchema]);

  const handleCommit = useCallback(
      () => {
        const { message, name, email } = commitData
        commit(JSON.stringify(pollData, null, 2), message, {
          name,
          email
        })
      },
      [commit, commitData, pollData],
  );


  const handleChange = useCallback(
      ({ data }) => {
        setCommitData(data)
      },
      [setCommitData],
  )

  return (<Container>
    <JsonForms
        data={commitData}
        // @ts-ignore
        schema={mySchema}
        uischema={uischema}
        onChange={handleChange}
        renderers={materialRenderers} cells={materialCells} />
    <Button color={'success'} startIcon={<GitHub />} onClick={handleCommit}>Commit rating</Button>
    </Container>);
};

export default CompareAndCommit;
