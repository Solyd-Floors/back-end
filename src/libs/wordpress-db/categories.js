
const wp_db = require("./index")

module.exports = {
    findAll: async () => {
        await wp_db;
        console.log({wp_db})
        // let query = `
        //     select 
        //         wp_term_taxonomy.term_id, 
        //         wp_term_taxonomy.taxonomy, 
        //         wp_terms.term_id, 
        //         wp_terms.name, 
        //         wp_terms.slug 
        //     from 
        //         wp_term_taxonomy 
        //             inner join wp_terms 
        //                 ON 
        //                     wp_term_taxonomy.taxonomy='category' and 
        //                     wp_term_taxonomy.term_id=wp_terms.term_id;
        // `
        let query = `
            SELECT wp_terms.*
            FROM wp_terms 
            LEFT JOIN wp_term_taxonomy ON wp_terms.term_id = wp_term_taxonomy.term_id
            WHERE wp_term_taxonomy.taxonomy = 'product_cat';
        `
        const [rows, fields] = await wp_db.execute(
            query,
        );
        console.log({rows,fields})
        return rows;
    }
}

