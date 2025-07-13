import { paginate } from '../../middleware/paginate.js';

describe('paginate middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    it('should set default pagination when no query is provided', () => {
        paginate(req, res, next);

        expect(req.pagination).toEqual({
            page: 1,
            limit: 10,
            offset: 0,
            limitPlusOne: 11
        });
        expect(next).toHaveBeenCalled();
    });

    it('should parse valid query parameters', () => {
        req.query.page = '2';
        req.query.limit = '5';

        paginate(req, res, next);

        expect(req.pagination).toEqual({
            page: 2,
            limit: 5,
            offset: 5,
            limitPlusOne: 6
        });
        expect(next).toHaveBeenCalled();
    });

    it('should return 400 if page or limit is invalid', () => {
        req.query.page = '-1';
        req.query.limit = '0';

        paginate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Page and limit must be positive integers.' });
        expect(next).not.toHaveBeenCalled();
    });
});