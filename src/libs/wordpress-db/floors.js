const { ErrorHandler } = require("../../utils/error");
const wp_db = require("./index");

let sf_insertThumbnailIntoFloor = floor => {
    let default_image = floor.images && floor.images[0]
    floor.thumbnail_url = default_image && default_image.guid || null
    if (!floor.thumbnail_url) floor.thumbnail_url = "https://solyd-floors.vercel.app/product-placeholder-300x300.png"
}

const findAttachments = async post_id => {
    const query = `
        SELECT 
            * 
        FROM 
            wp_postmeta 
        WHERE 
            post_id=${post_id}
        AND 
            meta_key 
                IN ( '_wp_attached_file', '_wp_attachment_backup_sizes', '_wp_attachment_metadata', '_thumbnail_id' );
    `
    const [post_metas_rows, post_metas_fields] = await wp_db.execute(query);

    let attachments = [];
    for (let row of post_metas_rows){
        const attach_query = `
            select * from wp_posts where id=${row.meta_value};
        `   
        console.log({attach_query})
        const [attach_rows] = await wp_db.execute(attach_query);
        attachments = attachments.concat(attach_rows)
    }

    return attachments;
}

const findMetas = async post_id => {
    const query = `
    select * from wp_postmeta where post_id=${post_id};
    `
    console.log({post_id,query})
    const [rows] = await wp_db.execute(query);
    const parsed = {}
    for (let x = 0; x < rows.length; x++){
        const row = rows[x]
        const { meta_key, meta_value } = row
        parsed[meta_key] = meta_value 
    }
    return parsed;
}

const findTerms = async post_id => {
    const query = `
        select * from wp_term_relationships where object_id=${post_id};
    `
    const [rows] = await wp_db.execute(query);
    const relations = []
    for (let row of rows){
        const term_taxonomy_query = `
            select * from wp_term_taxonomy where term_taxonomy_id=${row.term_taxonomy_id};
        `
        const [term_taxonomy_rows] = await wp_db.execute(term_taxonomy_query);
        const [term_taxonomy_row] = term_taxonomy_rows;
        const term_query = `
            select * from wp_terms where term_id=${term_taxonomy_row.term_id};
        `
        const [term_rows] = await wp_db.execute(term_query);
        const [term_row] = term_rows;
        const relation = [
            term_taxonomy_row,
            term_row
        ]
        relations.push(relation)

    }
    return relations;
}

const filterFloors = async ({ FloorCategoryId, FloorTypeSlug, Color, min_price, max_price }, floors) => {
    if (FloorCategoryId){
        floors = floors.filter(floor => {
            const category_term = floor.terms.find(t => {
                const [taxonomy,term] = t
                if (
                    taxonomy.taxonomy === 'product_cat' &&
                    term.term_id == FloorCategoryId
                ) return true
                return false
            })
            return Boolean(category_term)
        })
    }
    if (FloorTypeSlug){
        floors = floors.filter(floor => {
            const category_term = floor.terms.find(t => {
                const [taxonomy,term] = t
                if (
                    taxonomy.taxonomy === 'product_tag' &&
                    term.slug == FloorTypeSlug
                ) return true
                return false
            })
            return Boolean(category_term)
        })
    }
    if (Color){
        floors = floors.filter(floor => {
            const category_term = floor.terms.find(t => {
                const [taxonomy,term] = t
                if (
                    taxonomy.taxonomy === 'pa_color' &&
                    term.slug == Color
                ) return true
                return false
            })
            return Boolean(category_term)
        })
    }
    if (min_price !== undefined && max_price !== undefined) {
        floors = floors.filter(floor => {
            const price = findCheapestFloorBoxPriceFor({ floor })
            console.log({price,min_price,max_price})
            return price > min_price && price < max_price;
        })
    }
    console.log("FILTERING WITH", { FloorCategoryId, FloorTypeSlug, Color })
    return floors;
}

let insertPlankDimensionsIntoFloor = floor => {
    let plank_dimensions = floor.attributes.find(x => x.name === "Plank dimensions").options[0]
    floor.plank_dimensions = plank_dimensions
  }

const findCheapestFloorBoxPriceFor = ({ floor }) => {
    let price;
    for (let variation of floor.Variations || []) {
        let variationPrice = Number(variation.price);
        if (Number.isNaN(variationPrice)) continue;
        if (variationPrice < price || price === undefined) price = variationPrice;
    }
    return price || null;
}

const _wp_to_sf = wp_floor => {
    wp_floor.name = wp_floor.post_title
    // insertPlankDimensionsIntoFloor(wp_floor)
    return wp_floor
}
const wp_to_sf = data => {
    const isArray = data.length !== undefined
    if (isArray){
        return data.map(d => _wp_to_sf(d))
    }
    return _wp_to_sf(data);
}

module.exports = {
    findAll: async (options = {}) => {
        console.log({options})
        let querySearch = options.query ? ` and post_title LIKE '%${options.query}%'` : ''
        if (options.id){
            let q = `ID=${options.id}`
            querySearch = querySearch ? `${querySearch} and  ${q}` : ` and  ${q}`
        }
        const query = `
            select * from wp_posts where post_type='product' ${querySearch};
        `
        let [rows, fields] = await wp_db.execute(query);
        for (row of rows){
            row.id = row.ID
            row.Variations = []
            const variations_query = `
                select * from wp_posts where post_type='product_variation' and post_parent=${row.ID};
            `
            const [variations_rows, variations_fields] = await wp_db.execute(variations_query);
            row.Variations = variations_rows;
            row.terms = await findTerms(row.id)
            for (variation of row.Variations){
                variation.id = variation.ID
                variation.images = await findAttachments(variation.id)
                sf_insertThumbnailIntoFloor(variation)
                variation.meta = await findMetas(variation.id)
                variation.price = variation.meta && variation.meta._price
    
            }
            
            // const links_query = `
            //     select * from wp_links where link_url='${row.guid}';
            // `
            // const [links_rows, links_fields] = await wp_db.execute(links_query);
            // row.Links = links_rows;
            
            row.images = await findAttachments(row.id)
            sf_insertThumbnailIntoFloor(row)
            row.meta = await findMetas(row.id)
            row.price = row.meta._price
        }
        // const filtered_rows = JSON.parse(JSON.stringify(rows))
        rows = await filterFloors(options,rows)
        return wp_to_sf(rows);

    },
    findByPkOr404: async floor_id => {
        const floors = await module.exports.findAll({ id: floor_id });
        const floor = floors[0];
        if (floor) return floor;
        throw new ErrorHandler(404, `Floor with id=${floor_id} not found!`);
    },
    findCheapestFloorBoxPriceFor
}
