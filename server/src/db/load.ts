import { repo } from "./data-source";

export async function getElements() {
  const elementRepo = repo(Element);
  return await elementRepo.find();
}
