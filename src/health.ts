export async function checkHealth(internalData: boolean) {
    if (internalData == true){
        return {data: "OK", status: { status: 200 }};
    }
    return {data: "Error: No connected webhooks", status: { status: 400 }};

};