// this file pulls all models from *.controller.ts from the controllers folder and dumps them into the models folder on the client

const { Project, StructureKind, SyntaxKind, OptionalKind, PropertyDeclarationStructure } = require("ts-morph");

async function main(){
    let start = Date.now();
    var project = new Project({}); // modify ts file
    var files = project.addSourceFilesAtPaths(`${__dirname}/server/src/controllers/**/*.controller.ts`);

    await Promise.all(files.map(async file => {
        let name = file.getBaseName().split(".")[0];
        let classes = file.getClasses();
        let newFile = project.createSourceFile(`${__dirname}/client/src/models/${name}.ts`,null, { overwrite: true });
        for(let classInfo of classes) {
            var classProps = classInfo.getInstanceProperties();
            let properties = [];
            for(let property of classProps) {
                properties.push({
                    name: property.getName(),
                    type: property.getType() ? property.getType().getText().replace(/import\(.+?\)\./,"") : undefined,
                    initializer: property.getInitializer() ? property.getInitializer().getText() : undefined,
                    hasQuestionToken: true,
                });
            }
            let newClass = newFile.addClass({ name: classInfo.getName(), isExported: true, properties: properties });
            let constructor = classInfo.getConstructors()[0];
            if(constructor) {
                newClass.addConstructor(constructor.getStructure());
            }
        }
        let enums = file.getEnums();
        for(let enumInfo of enums) {
            let members = [];
            for(let memberInfo of enumInfo.getMembers()) {
                members.push({
                    name: memberInfo.getName(),
                    value: memberInfo.getValue()
                })
            }
            newFile.addEnum({name: enumInfo.getName(), isExported: true, members: members })
        }
        await newFile.save();
    }));
    let end = Date.now();
    console.log((end-start)/1000)
}
main();