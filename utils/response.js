export const successAPIResponse = (body = null, success = true) => {
    return { body: body, success: success }
}

export const errorAPIResponse = (error = null, success = false) => {
    return { error: error, success: success }
}