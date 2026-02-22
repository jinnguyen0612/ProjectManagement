import "dotenv/config";
import prisma from "../src/infrastructure/libs/prisma";
import fs from "fs";
import path from "path";

async function deleteAllData(orderedFileNames: string[]) {
    const modelNames = orderedFileNames.map((fileName) => {
        const modelName = path.basename(fileName, path.extname(fileName));
        return modelName.charAt(0).toUpperCase() + modelName.slice(1);
    });

    for (const modelName of [...modelNames].reverse()) {
        const model: any = prisma[modelName as keyof typeof prisma];
        if (model) {
            await model.deleteMany({});
            console.log(`Cleared data from ${modelName}`);
        } else {
            console.error(
                `Model ${modelName} not found. Please ensure the model name is correctly specified.`
            );
        }
    }
}

async function main() {
    const dataDirectory = path.join(__dirname, "seed");

    const orderedFileNames = [
        "roles.json",
        "permissions.json",
        "users.json",
        "usersRoles.json",
        "rolesPermissions.json",
        "projects.json",
        "members.json",
        "statuses.json",
        "labels.json",
        "tasks.json",
        "tasksMembers.json",
        "tasksLabels.json",
        "notifications.json",
    ];

    await deleteAllData(orderedFileNames);

    for (const fileName of orderedFileNames) {
        const filePath = path.join(dataDirectory, fileName);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const modelName = path.basename(fileName, path.extname(fileName));
        const model: any = prisma[modelName as keyof typeof prisma];

        if (!model) {
            console.error(`No Prisma model matches the file name: ${fileName}`);
            continue;
        }

        for (const data of jsonData) {
            await model.create({
                data,
            });
        }

        console.log(`Seeded ${modelName} with data from ${fileName}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        console.log("Seeding end");
        await prisma.$disconnect();
    });