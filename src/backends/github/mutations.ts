import { gql } from 'graphql-tag';

import * as fragments from './fragments';

// updateRef only works for branches at the moment
export const updateBranch = gql`
  mutation updateRef($input: UpdateRefInput!) {
    updateRef(input: $input) {
      branch: ref {
        ...BranchParts
      }
    }
  }
  ${fragments.branch}
`;

// deleteRef only works for branches at the moment
const deleteRefMutationPart = `
deleteRef(input: $deleteRefInput) {
  clientMutationId
}
`;
export const deleteBranch = gql`
  mutation deleteRef($deleteRefInput: DeleteRefInput!) {
    ${deleteRefMutationPart}
  }
`;

export const createBranch = gql`
  mutation createBranch($createRefInput: CreateRefInput!) {
    createRef(input: $createRefInput) {
      branch: ref {
        ...BranchParts
      }
    }
  }
  ${fragments.branch}
`;
