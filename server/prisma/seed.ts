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
        "appUsingAPI.json",
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

    // Fix sequences after seeding
    console.log('\n🔧 Fixing database sequences...');
    await fixSequences();
}

async function fixSequences() {
    const sequences = [
        { name: 'users_id_seq', table: 'users' },
        { name: 'roles_id_seq', table: 'roles' },
        { name: 'permissions_id_seq', table: 'permissions' },
        { name: 'projects_id_seq', table: 'projects' },
        { name: 'members_id_seq', table: 'members' },
        { name: 'statuses_id_seq', table: 'statuses' },
        { name: 'labels_id_seq', table: 'labels' },
        { name: 'tasks_id_seq', table: 'tasks' },
        { name: 'otps_id_seq', table: 'otps' },
        { name: 'notifications_id_seq', table: 'notifications' },
        { name: 'attachments_id_seq', table: 'attachments' },
        { name: 'jwt_tokens_id_seq', table: 'jwt_tokens' },
        { name: 'app_using_api_id_seq', table: 'app_using_api' }, // Fixed: lowercase
    ];

    for (const seq of sequences) {
        try {
            await prisma.$executeRawUnsafe(
                `SELECT setval('${seq.name}', (SELECT COALESCE(MAX(id), 1) FROM ${seq.table}));`
            );
            console.log(`✅ Fixed ${seq.name}`);
        } catch (error) {
            console.error(`❌ Error fixing ${seq.name}:`, error);
        }
    }

    console.log('✨ All sequences fixed!\n');
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        console.log("Seeding end");
        await prisma.$disconnect();
    });