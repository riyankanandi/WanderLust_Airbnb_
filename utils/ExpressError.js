// class ExpressError extends Error{
//     constructor(status){
//         super();
//         this.statusCode=statusCode;
//         this.message=message;
//     }
// }
// module.exports=ExpressError;


class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message);  // Pass message to parent Error class
        this.statusCode = statusCode;
        this.message = message || 'Something went wrong';  // Default message if none is provided
        this.stack = (new Error()).stack;  // Optionally capture stack trace
    }
}

module.exports = ExpressError;
