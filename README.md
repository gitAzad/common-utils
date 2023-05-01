this is a collection of common utils that you can use in your project. using this you can avoid writing the same code again and again. also you can build your crud api in seconds.

## Install

```bash
npm install @mdazad/common-utils
```

or

```bash
yarn add @mdazad/common-utils
```

## Usage

**basic crud api using common-utils.**

tag.controller.js

```ts
import { body } from 'express-validator';
import TagModel from '../models/tag.model.js';
import {
  createDocumentAndSendResponse,
  getAllDocumentAndSendResponse,
  validate,
  findByIdAndSendResponse,
  updateByIdAndSendResponse,
  deleteByIdAndSendResponse,
} from '@mdazad/common-utils';

export const createTag = [
  validate([body('name').notEmpty().withMessage('Name is required')]),
  async (req, res) => {
    await createDocumentAndSendResponse(req, res, TagModel, req.body);
  },
];

export const getTags = async (req, res) => {
  await getAllDocumentAndSendResponse(req, res, TagModel);
};

export const getTagById = async (req, res) => {
  await findByIdAndSendResponse(req, res, TagModel);
};

export const updateTagById = async (req, res) => {
  await updateByIdAndSendResponse(req, res, TagModel, req.body);
};

export const deleteTagById = async (req, res) => {
  await deleteByIdAndSendResponse(req, res, TagModel);
};
```

tag.route.js

```ts
import express from 'express';
import {
  createTag,
  getTags,
  getTagById,
  updateTagById,
  deleteTagById,
} from '../controllers/tag.controller.js';

import { authenticateToken } from '@mdazad/common-utils';

const router = express.Router();

// if you want to authenticate all the routes then use this
router.use(authenticateToken('JWT_SECRET', 'user_collection_name'));

router.post('/', createTag);
router.get('/', getTags);
router.get('/:id', getTagById);
router.put('/:id', updateTagById);
router.delete('/:id', deleteTagById);

export default router;
```

app.js

```ts
import express from 'express';

import tagRoutes from './routes/tag.route.js';

const app = express();

app.use(express.json());

app.use('/api/v1/tags', tagRoutes);

export default app;
```

## Docs link

[https://gitAzad.github.io/common-utils/](https://gitAzad.github.io/common-utils/)

Docs are generated using [typedoc](https://typedoc.org/).

---

## Features

- [x] Logger (winston) [docs](https://gitazad.github.io/common-utils/variables/logger.html)
- [x] Authenticate Request [docs](https://gitazad.github.io/common-utils/functions/authenticateToken.html)
- [x] Validate Request [docs](https://gitazad.github.io/common-utils/functions/validate.html)

- [x] Crud Operations
  - [x] Create [docs](https://gitazad.github.io/common-utils/functions/createDocumentAndSendResponse.html)
  - [x] Read [docs](https://gitazad.github.io/common-utils/functions/getAllDocumentAndSendResponse.html)
  - [x] Update [docs](https://gitazad.github.io/common-utils/functions/updateByIdAndSendResponse.html)
  - [x] Delete [docs](https://gitazad.github.io/common-utils/functions/deleteByIdAndSendResponse.html)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT
