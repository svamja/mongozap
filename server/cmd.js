
/*
    Run it to debug some of the API code, eg:
    node cmd.js SchemaMgr rebuild mongodb://localhost/ db_name collection_name
    node cmd.js Mongo get_databases
*/


async function main() {

    let args = process.argv;
    if(args.length < 4) {
        console.log('usage: node cmd.js ModuleName function_name [args]');
        process.exit(1);
        return;
    }

    args.shift();
    args.shift();
    let ModuleName = args.shift();
    let fn_name = args.shift();

    console.log(`running: ${ModuleName}.${fn_name}(` + args.join(', ') + ')');

    let module = require('./' + ModuleName);
    let result = await module[fn_name](...args);
    console.log(result);

}

main();