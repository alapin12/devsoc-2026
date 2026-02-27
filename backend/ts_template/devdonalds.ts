import { INSPECT_MAX_BYTES } from "buffer";
import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: (recipe | ingredient)[] = [];

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  if (recipeName.length <= 0) return null;
  const newString: string = recipeName
                        .replace(/[-_]/g, " ")
                        .replace(/[^a-zA-Z\s]/g, "")
                        .replace(/\s+/g, " ")
                        .toLowerCase();
  let words: string[] = newString.split(' ');
  words = words.map((word) => word.charAt(0).toUpperCase() + word.substring(1));
  return words.join(' ');
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  if (req.body.type != 'recipe' && req.body.type != 'ingredient') {
    return res.status(400).send('invalid type');
  } 
  if (req.body.cookTime < 0) {
    return res.status(400).send('cook time must be positive');
  }
  if (cookbook.find((entry) => entry.name === req.body.name)) {
    return res.status(400).send('name must be unique');
  }
  if (req.body.type === 'recipe') {
    // check for duped ingredients
    const items = req.body.requiredItems;
    const dupes = items.filter((item, index) => items.indexOf(item) !== index);
    if (dupes.length > 0) return res.status(400).send('duped required items');
  }
  cookbook.push(req.body);
  return res.status(200).json({});
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req: Request, res: Response) => {
  if (!req.query.name || typeof req.query.name !== "string") {
    return res.status(400).send("name query required");
  }

  const name = req.query.name;

  const foundEntry = cookbook.find((entry) => entry.name === name);

  if (!foundEntry) {
    return res.status(400).send("no recipe exists with this name");
  }

  if (foundEntry.type !== "recipe") {
    return res.status(400).send("this is not a recipe");
  }

  let cookTime = 0;
  const ingredients: requiredItem[] = [];

  const addIngredients = (recipeEntry: recipe, multiplier: number) => {
    for (const item of recipeEntry.requiredItems) {
      const cookEntry = cookbook.find((a) => a.name === item.name);

      if (!cookEntry) {
        throw new Error("required item not found");
      }

      const totalQuantity = multiplier * item.quantity;

      if (cookEntry.type === "ingredient") {
        const existing = ingredients.find(
          (ing) => ing.name === item.name
        );

        if (!existing) {
          ingredients.push({
            name: item.name,
            quantity: totalQuantity,
          });
        } else {
          existing.quantity += totalQuantity;
        }

        cookTime +=
          totalQuantity * (cookEntry as ingredient).cookTime;
      }

      if (cookEntry.type === "recipe") {
        addIngredients(cookEntry as recipe, totalQuantity);
      }
    }
  };

  try {
    addIngredients(foundEntry as recipe, 1);
    return res.status(200).json({
      name: foundEntry.name,
      cookTime,
      ingredients,
    });
  } catch (err) {
    return res.status(400).send((err as Error).message);
  }
});


// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
