
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\global\Section.svelte generated by Svelte v3.44.0 */

    const file$d = "src\\components\\global\\Section.svelte";

    function create_fragment$d(ctx) {
    	let section;
    	let section_id_value;
    	let section_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			attr_dev(section, "id", section_id_value = /*$$props*/ ctx[0].id);
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(/*$$props*/ ctx[0].class) + " svelte-1dxowg1"));
    			add_location(section, file$d, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 1 && section_id_value !== (section_id_value = /*$$props*/ ctx[0].id)) {
    				attr_dev(section, "id", section_id_value);
    			}

    			if (!current || dirty & /*$$props*/ 1 && section_class_value !== (section_class_value = "" + (null_to_empty(/*$$props*/ ctx[0].class) + " svelte-1dxowg1"))) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('$$scope' in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\components\global\NavItems.svelte generated by Svelte v3.44.0 */

    const file$c = "src\\components\\global\\NavItems.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "About";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Work";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Contact";
    			attr_dev(a0, "href", "#home");
    			attr_dev(a0, "class", "svelte-zcvtfl");
    			add_location(a0, file$c, 2, 4, 56);
    			attr_dev(a1, "href", "#about");
    			attr_dev(a1, "class", "svelte-zcvtfl");
    			add_location(a1, file$c, 3, 4, 86);
    			attr_dev(a2, "href", "#work");
    			attr_dev(a2, "class", "svelte-zcvtfl");
    			add_location(a2, file$c, 4, 4, 118);
    			attr_dev(a3, "href", "#contact");
    			attr_dev(a3, "class", "svelte-zcvtfl");
    			add_location(a3, file$c, 5, 4, 148);
    			attr_dev(nav, "class", "brackets svelte-zcvtfl");
    			add_location(nav, file$c, 1, 2, 28);
    			attr_dev(div, "class", "navwrapper svelte-zcvtfl");
    			add_location(div, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(nav, t3);
    			append_dev(nav, a2);
    			append_dev(nav, t5);
    			append_dev(nav, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavItems', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavItems> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NavItems extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavItems",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\pages\Home.svelte generated by Svelte v3.44.0 */
    const file$b = "src\\components\\pages\\Home.svelte";

    // (6:0) <Section id="home" class="home">
    function create_default_slot$3(ctx) {
    	let div5;
    	let div0;
    	let p0;
    	let t0;
    	let p1;
    	let t2;
    	let div1;
    	let p2;
    	let t4;
    	let p3;
    	let t6;
    	let div2;
    	let p4;
    	let t8;
    	let p5;
    	let t10;
    	let div3;
    	let p6;
    	let t12;
    	let p7;
    	let t14;
    	let div4;
    	let p8;
    	let t16;
    	let div6;
    	let navitems;
    	let current;
    	navitems = new NavItems({ $$inline: true });

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = space();
    			p1 = element("p");
    			p1.textContent = "UX . UI . FE-DEV";
    			t2 = space();
    			div1 = element("div");
    			p2 = element("p");
    			p2.textContent = "Welcome";
    			t4 = space();
    			p3 = element("p");
    			p3.textContent = "Kevin";
    			t6 = space();
    			div2 = element("div");
    			p4 = element("p");
    			p4.textContent = "to my";
    			t8 = space();
    			p5 = element("p");
    			p5.textContent = "de";
    			t10 = space();
    			div3 = element("div");
    			p6 = element("p");
    			p6.textContent = "Website";
    			t12 = space();
    			p7 = element("p");
    			p7.textContent = "Meijer";
    			t14 = space();
    			div4 = element("div");
    			p8 = element("p");
    			p8.textContent = "Hover here !";
    			t16 = space();
    			div6 = element("div");
    			create_component(navitems.$$.fragment);
    			attr_dev(p0, "class", "perspective svelte-1skgoxm");
    			add_location(p0, file$b, 8, 6, 237);
    			attr_dev(p1, "class", "perspective svelte-1skgoxm");
    			add_location(p1, file$b, 9, 6, 270);
    			attr_dev(div0, "class", "perspective-line svelte-1skgoxm");
    			add_location(div0, file$b, 7, 4, 199);
    			attr_dev(p2, "class", "perspective svelte-1skgoxm");
    			add_location(p2, file$b, 12, 6, 369);
    			attr_dev(p3, "class", "perspective svelte-1skgoxm");
    			add_location(p3, file$b, 13, 6, 411);
    			attr_dev(div1, "class", "perspective-line svelte-1skgoxm");
    			add_location(div1, file$b, 11, 4, 331);
    			attr_dev(p4, "class", "perspective svelte-1skgoxm");
    			add_location(p4, file$b, 16, 6, 499);
    			attr_dev(p5, "class", "perspective svelte-1skgoxm");
    			add_location(p5, file$b, 17, 6, 539);
    			attr_dev(div2, "class", "perspective-line svelte-1skgoxm");
    			add_location(div2, file$b, 15, 4, 461);
    			attr_dev(p6, "class", "perspective svelte-1skgoxm");
    			add_location(p6, file$b, 20, 6, 624);
    			attr_dev(p7, "class", "perspective svelte-1skgoxm");
    			add_location(p7, file$b, 21, 6, 666);
    			attr_dev(div3, "class", "perspective-line svelte-1skgoxm");
    			add_location(div3, file$b, 19, 4, 586);
    			attr_dev(p8, "class", "perspective svelte-1skgoxm");
    			add_location(p8, file$b, 24, 6, 755);
    			attr_dev(div4, "class", "perspective-line svelte-1skgoxm");
    			add_location(div4, file$b, 23, 4, 717);
    			attr_dev(div5, "class", "perspective-text svelte-1skgoxm");
    			add_location(div5, file$b, 6, 2, 163);
    			attr_dev(div6, "class", "nav svelte-1skgoxm");
    			add_location(div6, file$b, 27, 2, 820);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t0);
    			append_dev(div0, p1);
    			append_dev(div5, t2);
    			append_dev(div5, div1);
    			append_dev(div1, p2);
    			append_dev(div1, t4);
    			append_dev(div1, p3);
    			append_dev(div5, t6);
    			append_dev(div5, div2);
    			append_dev(div2, p4);
    			append_dev(div2, t8);
    			append_dev(div2, p5);
    			append_dev(div5, t10);
    			append_dev(div5, div3);
    			append_dev(div3, p6);
    			append_dev(div3, t12);
    			append_dev(div3, p7);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, p8);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div6, anchor);
    			mount_component(navitems, div6, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navitems.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navitems.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div6);
    			destroy_component(navitems);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(6:0) <Section id=\\\"home\\\" class=\\\"home\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				id: "home",
    				class: "home",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Section, NavItems });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\global\Nav.svelte generated by Svelte v3.44.0 */
    const file$a = "src\\components\\global\\Nav.svelte";

    function create_fragment$a(ctx) {
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let div1;
    	let navitems;
    	let current;
    	navitems = new NavItems({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			create_component(navitems.$$.fragment);
    			add_location(h1, file$a, 7, 2, 122);
    			attr_dev(div0, "class", "chapter_title svelte-hg5nli");
    			add_location(div0, file$a, 6, 0, 91);
    			attr_dev(div1, "class", "chapter_nav svelte-hg5nli");
    			add_location(div1, file$a, 9, 0, 148);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(navitems, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navitems.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navitems.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(navitems);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	let { title } = $$props;
    	const writable_props = ['title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ title, NavItems });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<Nav> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src\components\content\Skillbars.svelte generated by Svelte v3.44.0 */

    const file$9 = "src\\components\\content\\Skillbars.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let span;
    	let b;
    	let t0;
    	let t1;
    	let div0;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			b = element("b");
    			t0 = text(/*skill*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(" ");
    			add_location(b, file$9, 23, 22, 549);
    			attr_dev(span, "class", "skill svelte-1oj4zbu");
    			add_location(span, file$9, 23, 2, 529);
    			attr_dev(div0, "class", "skills svelte-1oj4zbu");
    			set_style(div0, "width", /*$progress*/ ctx[2] + "%");
    			set_style(div0, "background-image", /*color*/ ctx[1]);
    			add_location(div0, file$9, 24, 2, 574);
    			attr_dev(div1, "class", "container svelte-1oj4zbu");
    			add_location(div1, file$9, 22, 0, 502);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, b);
    			append_dev(b, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*skill*/ 1) set_data_dev(t0, /*skill*/ ctx[0]);

    			if (dirty & /*$progress*/ 4) {
    				set_style(div0, "width", /*$progress*/ ctx[2] + "%");
    			}

    			if (dirty & /*color*/ 2) {
    				set_style(div0, "background-image", /*color*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skillbars', slots, []);
    	let { skill } = $$props;
    	let { percent } = $$props;
    	let { color } = $$props;
    	let { delTime } = $$props;

    	const progress = tweened(15, {
    		delay: delTime,
    		duration: 1500,
    		easing: cubicInOut
    	});

    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(2, $progress = value));

    	// Changes the initial value of 30 to percent value in skillLevels array
    	progress.set(percent);

    	const writable_props = ['skill', 'percent', 'color', 'delTime'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skillbars> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('skill' in $$props) $$invalidate(0, skill = $$props.skill);
    		if ('percent' in $$props) $$invalidate(4, percent = $$props.percent);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('delTime' in $$props) $$invalidate(5, delTime = $$props.delTime);
    	};

    	$$self.$capture_state = () => ({
    		tweened,
    		cubicInOut,
    		skill,
    		percent,
    		color,
    		delTime,
    		progress,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('skill' in $$props) $$invalidate(0, skill = $$props.skill);
    		if ('percent' in $$props) $$invalidate(4, percent = $$props.percent);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('delTime' in $$props) $$invalidate(5, delTime = $$props.delTime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [skill, color, $progress, progress, percent, delTime];
    }

    class Skillbars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			skill: 0,
    			percent: 4,
    			color: 1,
    			delTime: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skillbars",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*skill*/ ctx[0] === undefined && !('skill' in props)) {
    			console.warn("<Skillbars> was created without expected prop 'skill'");
    		}

    		if (/*percent*/ ctx[4] === undefined && !('percent' in props)) {
    			console.warn("<Skillbars> was created without expected prop 'percent'");
    		}

    		if (/*color*/ ctx[1] === undefined && !('color' in props)) {
    			console.warn("<Skillbars> was created without expected prop 'color'");
    		}

    		if (/*delTime*/ ctx[5] === undefined && !('delTime' in props)) {
    			console.warn("<Skillbars> was created without expected prop 'delTime'");
    		}
    	}

    	get skill() {
    		throw new Error("<Skillbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skill(value) {
    		throw new Error("<Skillbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get percent() {
    		throw new Error("<Skillbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set percent(value) {
    		throw new Error("<Skillbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Skillbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Skillbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delTime() {
    		throw new Error("<Skillbars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delTime(value) {
    		throw new Error("<Skillbars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\content\Skills.svelte generated by Svelte v3.44.0 */
    const file$8 = "src\\components\\content\\Skills.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].skill;
    	child_ctx[2] = list[i].percent;
    	child_ctx[3] = list[i].color;
    	child_ctx[4] = list[i].delTime;
    	return child_ctx;
    }

    // (46:2) {#each skillLevels as { skill, percent, color, delTime }}
    function create_each_block(ctx) {
    	let skillbar;
    	let current;

    	skillbar = new Skillbars({
    			props: {
    				skill: /*skill*/ ctx[1],
    				percent: /*percent*/ ctx[2],
    				color: /*color*/ ctx[3],
    				delTime: /*delTime*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(skillbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(skillbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(skillbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(skillbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(skillbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(46:2) {#each skillLevels as { skill, percent, color, delTime }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let current;
    	let each_value = /*skillLevels*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$8, 44, 0, 906);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*skillLevels*/ 1) {
    				each_value = /*skillLevels*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skills', slots, []);

    	const skillLevels = [
    		{
    			skill: 'HTML',
    			percent: 100,
    			color: 'var(--red_gradient_flip)',
    			delTime: 0
    		},
    		{
    			skill: '(S)CSS',
    			percent: 95,
    			color: 'var(--red_gradient_flip)',
    			delTime: 500
    		},
    		{
    			skill: 'JavaScript',
    			percent: 70,
    			color: 'var(--red_gradient_flip)',
    			delTime: 1000
    		},
    		{
    			skill: 'Svelte',
    			percent: 55,
    			color: 'var(--red_gradient_flip)',
    			delTime: 1500
    		},
    		{
    			skill: 'React',
    			percent: 50,
    			color: 'var(--red_gradient_flip)',
    			delTime: 1500
    		},
    		{
    			skill: 'Vue',
    			percent: 20,
    			color: 'var(--red_gradient_flip)',
    			delTime: 2500
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Skillbar: Skillbars, skillLevels });
    	return [skillLevels];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\pages\About.svelte generated by Svelte v3.44.0 */
    const file$7 = "src\\components\\pages\\About.svelte";

    // (10:0) <Section id="about" class="about">
    function create_default_slot$2(ctx) {
    	let nav;
    	let t0;
    	let div;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t5;
    	let a0;
    	let t6;
    	let t7;
    	let t8;
    	let h30;
    	let t10;
    	let p3;
    	let t11;
    	let a1;
    	let t12;
    	let t13;
    	let t14;
    	let h31;
    	let t16;
    	let skills;
    	let current;

    	nav = new Nav({
    			props: { title: "About" },
    			$$inline: true
    		});

    	skills = new Skills({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "I am a passionate Front-end Developer and UX Designer from The\r\n      Netherlands.";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "My areas of expertise encompass all Front-end work you can dream of: from\r\n      creating a sketch, working it out digitally, developing the first\r\n      prototype, to the last bits of css that are causing a headache.";
    			t4 = space();
    			p2 = element("p");
    			t5 = text("I am currently studying at\r\n      ");
    			a0 = element("a");
    			t6 = text("Hogeschool Utrecht");
    			t7 = text(" based in the\r\n      Netherlands.");
    			t8 = space();
    			h30 = element("h3");
    			h30.textContent = "Art Style";
    			t10 = space();
    			p3 = element("p");
    			t11 = text("I love pastels and also the colors\r\n      ");
    			a1 = element("a");
    			t12 = text("Piet Mondriaan");
    			t13 = text("\r\n      used in his paintings.");
    			t14 = space();
    			h31 = element("h3");
    			h31.textContent = "My Skills";
    			t16 = space();
    			create_component(skills.$$.fragment);
    			attr_dev(p0, "class", "bold");
    			add_location(p0, file$7, 12, 4, 360);
    			add_location(p1, file$7, 16, 4, 482);
    			attr_dev(a0, "class", "link");
    			attr_dev(a0, "href", HU);
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$7, 24, 6, 773);
    			add_location(p2, file$7, 22, 4, 728);
    			attr_dev(h30, "class", "svelte-y0ok90");
    			add_location(h30, file$7, 28, 4, 888);
    			attr_dev(a1, "class", "link");
    			attr_dev(a1, "href", Mondriaan);
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$7, 31, 6, 965);
    			add_location(p3, file$7, 29, 4, 912);
    			attr_dev(h31, "class", "svelte-y0ok90");
    			add_location(h31, file$7, 35, 4, 1081);
    			attr_dev(div, "class", "text");
    			add_location(div, file$7, 11, 2, 336);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(div, t4);
    			append_dev(div, p2);
    			append_dev(p2, t5);
    			append_dev(p2, a0);
    			append_dev(a0, t6);
    			append_dev(p2, t7);
    			append_dev(div, t8);
    			append_dev(div, h30);
    			append_dev(div, t10);
    			append_dev(div, p3);
    			append_dev(p3, t11);
    			append_dev(p3, a1);
    			append_dev(a1, t12);
    			append_dev(p3, t13);
    			append_dev(div, t14);
    			append_dev(div, h31);
    			append_dev(div, t16);
    			mount_component(skills, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(skills);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(10:0) <Section id=\\\"about\\\" class=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				id: "about",
    				class: "about",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const Mondriaan = 'https://en.wikipedia.org/wiki/Piet_Mondrian';
    const HU = 'https://www.hu.nl/';

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nav, Section, Skills, Mondriaan, HU });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\content\PortfolioCard.svelte generated by Svelte v3.44.0 */

    const file$6 = "src\\components\\content\\PortfolioCard.svelte";
    const get_desc_slot_changes = dirty => ({});
    const get_desc_slot_context = ctx => ({});
    const get_year_slot_changes = dirty => ({});
    const get_year_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    // (3:23)         
    function fallback_block_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Something went wrong here";
    			attr_dev(span, "class", "missing svelte-bnlt84");
    			add_location(span, file$6, 3, 6, 69);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(3:23)         ",
    		ctx
    	});

    	return block;
    }

    // (9:22)         
    function fallback_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Please contact me about it";
    			attr_dev(span, "class", "missing svelte-bnlt84");
    			add_location(span, file$6, 9, 6, 201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(9:22)         ",
    		ctx
    	});

    	return block;
    }

    // (15:22)         
    function fallback_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "missing svelte-bnlt84");
    			add_location(span, file$6, 15, 6, 335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(15:22)         ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let h2;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[1].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[0], get_title_slot_context);
    	const title_slot_or_fallback = title_slot || fallback_block_2(ctx);
    	const year_slot_template = /*#slots*/ ctx[1].year;
    	const year_slot = create_slot(year_slot_template, ctx, /*$$scope*/ ctx[0], get_year_slot_context);
    	const year_slot_or_fallback = year_slot || fallback_block_1(ctx);
    	const desc_slot_template = /*#slots*/ ctx[1].desc;
    	const desc_slot = create_slot(desc_slot_template, ctx, /*$$scope*/ ctx[0], get_desc_slot_context);
    	const desc_slot_or_fallback = desc_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			if (title_slot_or_fallback) title_slot_or_fallback.c();
    			t0 = space();
    			div0 = element("div");
    			if (year_slot_or_fallback) year_slot_or_fallback.c();
    			t1 = space();
    			div1 = element("div");
    			if (desc_slot_or_fallback) desc_slot_or_fallback.c();
    			attr_dev(h2, "class", "svelte-bnlt84");
    			add_location(h2, file$6, 1, 2, 32);
    			attr_dev(div0, "class", "year svelte-bnlt84");
    			add_location(div0, file$6, 7, 2, 151);
    			attr_dev(div1, "class", "desc svelte-bnlt84");
    			add_location(div1, file$6, 13, 2, 285);
    			attr_dev(div2, "class", "portfolio-card svelte-bnlt84");
    			add_location(div2, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);

    			if (title_slot_or_fallback) {
    				title_slot_or_fallback.m(h2, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div0);

    			if (year_slot_or_fallback) {
    				year_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (desc_slot_or_fallback) {
    				desc_slot_or_fallback.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[0], dirty, get_title_slot_changes),
    						get_title_slot_context
    					);
    				}
    			}

    			if (year_slot) {
    				if (year_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						year_slot,
    						year_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(year_slot_template, /*$$scope*/ ctx[0], dirty, get_year_slot_changes),
    						get_year_slot_context
    					);
    				}
    			}

    			if (desc_slot) {
    				if (desc_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						desc_slot,
    						desc_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(desc_slot_template, /*$$scope*/ ctx[0], dirty, get_desc_slot_changes),
    						get_desc_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot_or_fallback, local);
    			transition_in(year_slot_or_fallback, local);
    			transition_in(desc_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot_or_fallback, local);
    			transition_out(year_slot_or_fallback, local);
    			transition_out(desc_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (title_slot_or_fallback) title_slot_or_fallback.d(detaching);
    			if (year_slot_or_fallback) year_slot_or_fallback.d(detaching);
    			if (desc_slot_or_fallback) desc_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PortfolioCard', slots, ['title','year','desc']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PortfolioCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class PortfolioCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PortfolioCard",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\content\Portfolio.svelte generated by Svelte v3.44.0 */
    const file$5 = "src\\components\\content\\Portfolio.svelte";

    // (6:2) 
    function create_title_slot_3(ctx) {
    	let span;
    	let h4;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h4 = element("h4");
    			h4.textContent = "Barber's Application";
    			add_location(h4, file$5, 5, 21, 125);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$5, 5, 2, 106);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h4);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_3.name,
    		type: "slot",
    		source: "(6:2) ",
    		ctx
    	});

    	return block;
    }

    // (7:2) 
    function create_year_slot_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Year 1 | Semester 1";
    			attr_dev(span, "slot", "year");
    			add_location(span, file$5, 6, 2, 165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_year_slot_3.name,
    		type: "slot",
    		source: "(7:2) ",
    		ctx
    	});

    	return block;
    }

    // (8:2) 
    function create_desc_slot_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "A project dedicated to learn the ways of Agile working. Delivering updates\r\n    every 2 weeks.";
    			attr_dev(span, "slot", "desc");
    			add_location(span, file$5, 7, 2, 215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_desc_slot_3.name,
    		type: "slot",
    		source: "(8:2) ",
    		ctx
    	});

    	return block;
    }

    // (15:2) 
    function create_title_slot_2(ctx) {
    	let span;
    	let h4;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h4 = element("h4");
    			h4.textContent = "Employment Insights";
    			add_location(h4, file$5, 14, 21, 404);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$5, 14, 2, 385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h4);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_2.name,
    		type: "slot",
    		source: "(15:2) ",
    		ctx
    	});

    	return block;
    }

    // (16:2) 
    function create_year_slot_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Year 1 | Semester 2";
    			attr_dev(span, "slot", "year");
    			add_location(span, file$5, 15, 2, 444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_year_slot_2.name,
    		type: "slot",
    		source: "(16:2) ",
    		ctx
    	});

    	return block;
    }

    // (17:2) 
    function create_desc_slot_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "A webpage which tracks existing job offers, to tell current students what is\r\n    needed in jobs they need to learn.";
    			attr_dev(span, "slot", "desc");
    			add_location(span, file$5, 16, 2, 494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_desc_slot_2.name,
    		type: "slot",
    		source: "(17:2) ",
    		ctx
    	});

    	return block;
    }

    // (24:2) 
    function create_title_slot_1(ctx) {
    	let span;
    	let h4;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h4 = element("h4");
    			h4.textContent = "Learning Analytics";
    			add_location(h4, file$5, 23, 21, 705);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$5, 23, 2, 686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h4);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(24:2) ",
    		ctx
    	});

    	return block;
    }

    // (25:2) 
    function create_year_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Year 2";
    			attr_dev(span, "slot", "year");
    			add_location(span, file$5, 24, 2, 744);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_year_slot_1.name,
    		type: "slot",
    		source: "(25:2) ",
    		ctx
    	});

    	return block;
    }

    // (26:2) 
    function create_desc_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "LeAn tracked educational progress of students. This was done through showing\r\n    them progress of teacher feedback, reviews done/given and worked hours. All\r\n    on the same convenient page.";
    			attr_dev(span, "slot", "desc");
    			add_location(span, file$5, 25, 2, 780);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_desc_slot_1.name,
    		type: "slot",
    		source: "(26:2) ",
    		ctx
    	});

    	return block;
    }

    // (34:2) 
    function create_title_slot(ctx) {
    	let span;
    	let h4;
    	let a;

    	const block = {
    		c: function create() {
    			span = element("span");
    			h4 = element("h4");
    			a = element("a");
    			a.textContent = "FyndR";
    			attr_dev(a, "class", "link");
    			attr_dev(a, "href", "https://openict.fyndr.wiki");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 35, 6, 1084);
    			add_location(h4, file$5, 34, 5, 1072);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$5, 33, 2, 1047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h4);
    			append_dev(h4, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(34:2) ",
    		ctx
    	});

    	return block;
    }

    // (40:2) 
    function create_year_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Year 3";
    			attr_dev(span, "slot", "year");
    			add_location(span, file$5, 39, 2, 1193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_year_slot.name,
    		type: "slot",
    		source: "(40:2) ",
    		ctx
    	});

    	return block;
    }

    // (41:2) 
    function create_desc_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "An educational database where students and teachers can upload files,\r\n    webpages or presentations. This allowed other students that were having the\r\n    same problems to look up solutions easier.";
    			attr_dev(span, "slot", "desc");
    			add_location(span, file$5, 40, 2, 1229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_desc_slot.name,
    		type: "slot",
    		source: "(41:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let portfoliocard0;
    	let t0;
    	let portfoliocard1;
    	let t1;
    	let portfoliocard2;
    	let t2;
    	let portfoliocard3;
    	let current;

    	portfoliocard0 = new PortfolioCard({
    			props: {
    				$$slots: {
    					desc: [create_desc_slot_3],
    					year: [create_year_slot_3],
    					title: [create_title_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	portfoliocard1 = new PortfolioCard({
    			props: {
    				$$slots: {
    					desc: [create_desc_slot_2],
    					year: [create_year_slot_2],
    					title: [create_title_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	portfoliocard2 = new PortfolioCard({
    			props: {
    				$$slots: {
    					desc: [create_desc_slot_1],
    					year: [create_year_slot_1],
    					title: [create_title_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	portfoliocard3 = new PortfolioCard({
    			props: {
    				$$slots: {
    					desc: [create_desc_slot],
    					year: [create_year_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(portfoliocard0.$$.fragment);
    			t0 = space();
    			create_component(portfoliocard1.$$.fragment);
    			t1 = space();
    			create_component(portfoliocard2.$$.fragment);
    			t2 = space();
    			create_component(portfoliocard3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(portfoliocard0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(portfoliocard1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(portfoliocard2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(portfoliocard3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const portfoliocard0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				portfoliocard0_changes.$$scope = { dirty, ctx };
    			}

    			portfoliocard0.$set(portfoliocard0_changes);
    			const portfoliocard1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				portfoliocard1_changes.$$scope = { dirty, ctx };
    			}

    			portfoliocard1.$set(portfoliocard1_changes);
    			const portfoliocard2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				portfoliocard2_changes.$$scope = { dirty, ctx };
    			}

    			portfoliocard2.$set(portfoliocard2_changes);
    			const portfoliocard3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				portfoliocard3_changes.$$scope = { dirty, ctx };
    			}

    			portfoliocard3.$set(portfoliocard3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(portfoliocard0.$$.fragment, local);
    			transition_in(portfoliocard1.$$.fragment, local);
    			transition_in(portfoliocard2.$$.fragment, local);
    			transition_in(portfoliocard3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(portfoliocard0.$$.fragment, local);
    			transition_out(portfoliocard1.$$.fragment, local);
    			transition_out(portfoliocard2.$$.fragment, local);
    			transition_out(portfoliocard3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(portfoliocard0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(portfoliocard1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(portfoliocard2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(portfoliocard3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portfolio', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ PortfolioCard });
    	return [];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\pages\Work.svelte generated by Svelte v3.44.0 */
    const file$4 = "src\\components\\pages\\Work.svelte";

    // (7:0) <Section id="work" class="work">
    function create_default_slot$1(ctx) {
    	let nav;
    	let t;
    	let div;
    	let portfolio;
    	let current;
    	nav = new Nav({ props: { title: "Work" }, $$inline: true });
    	portfolio = new Portfolio({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t = space();
    			div = element("div");
    			create_component(portfolio.$$.fragment);
    			attr_dev(div, "class", "text");
    			add_location(div, file$4, 8, 2, 233);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(portfolio, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(portfolio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(portfolio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(portfolio);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(7:0) <Section id=\\\"work\\\" class=\\\"work\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				id: "work",
    				class: "work",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Work', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nav, Section, Portfolio });
    	return [];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\content\SocialIcon.svelte generated by Svelte v3.44.0 */

    const file$3 = "src\\components\\content\\SocialIcon.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let a;
    	let div1;
    	let div0;
    	let i;
    	let i_class_value;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*fa_icon*/ ctx[2]) + " svelte-19z124m"));
    			add_location(i, file$3, 10, 8, 204);
    			attr_dev(div0, "class", "icon svelte-19z124m");
    			add_location(div0, file$3, 9, 6, 176);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*color*/ ctx[1]) + " svelte-19z124m"));
    			add_location(div1, file$3, 8, 4, 149);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", /*link*/ ctx[0]);
    			attr_dev(a, "class", "svelte-19z124m");
    			add_location(a, file$3, 7, 2, 112);
    			attr_dev(div2, "class", "socials svelte-19z124m");
    			add_location(div2, file$3, 6, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fa_icon*/ 4 && i_class_value !== (i_class_value = "" + (null_to_empty(/*fa_icon*/ ctx[2]) + " svelte-19z124m"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*color*/ 2 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*color*/ ctx[1]) + " svelte-19z124m"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*link*/ 1) {
    				attr_dev(a, "href", /*link*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SocialIcon', slots, []);
    	let { link } = $$props;
    	let { color } = $$props;
    	let { fa_icon } = $$props;
    	const writable_props = ['link', 'color', 'fa_icon'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SocialIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('link' in $$props) $$invalidate(0, link = $$props.link);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('fa_icon' in $$props) $$invalidate(2, fa_icon = $$props.fa_icon);
    	};

    	$$self.$capture_state = () => ({ link, color, fa_icon });

    	$$self.$inject_state = $$props => {
    		if ('link' in $$props) $$invalidate(0, link = $$props.link);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('fa_icon' in $$props) $$invalidate(2, fa_icon = $$props.fa_icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [link, color, fa_icon];
    }

    class SocialIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { link: 0, color: 1, fa_icon: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialIcon",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*link*/ ctx[0] === undefined && !('link' in props)) {
    			console.warn("<SocialIcon> was created without expected prop 'link'");
    		}

    		if (/*color*/ ctx[1] === undefined && !('color' in props)) {
    			console.warn("<SocialIcon> was created without expected prop 'color'");
    		}

    		if (/*fa_icon*/ ctx[2] === undefined && !('fa_icon' in props)) {
    			console.warn("<SocialIcon> was created without expected prop 'fa_icon'");
    		}
    	}

    	get link() {
    		throw new Error("<SocialIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<SocialIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<SocialIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<SocialIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fa_icon() {
    		throw new Error("<SocialIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fa_icon(value) {
    		throw new Error("<SocialIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\content\SocialIconArray.svelte generated by Svelte v3.44.0 */
    const file$2 = "src\\components\\content\\SocialIconArray.svelte";

    function create_fragment$2(ctx) {
    	let link;
    	let t0;
    	let div;
    	let socialicon0;
    	let t1;
    	let socialicon1;
    	let t2;
    	let socialicon2;
    	let t3;
    	let socialicon3;
    	let t4;
    	let socialicon4;
    	let t5;
    	let socialicon5;
    	let t6;
    	let socialicon6;
    	let t7;
    	let socialicon7;
    	let current;

    	socialicon0 = new SocialIcon({
    			props: {
    				link: "https://github.com/KevindeMeijer",
    				color: "social-icon github",
    				fa_icon: "fa fa-github"
    			},
    			$$inline: true
    		});

    	socialicon1 = new SocialIcon({
    			props: {
    				link: "https://steamcommunity.com/id/kevkev_beast/",
    				color: "social-icon steam",
    				fa_icon: "fa fa-steam"
    			},
    			$$inline: true
    		});

    	socialicon2 = new SocialIcon({
    			props: {
    				link: "https://www.linkedin.com/in/kevindemeijer/",
    				color: "social-icon linkedin",
    				fa_icon: "fa fa-linkedin-square"
    			},
    			$$inline: true
    		});

    	socialicon3 = new SocialIcon({
    			props: {
    				link: "https://codepen.io/Kevin_de_Meijer",
    				color: "social-icon codepen",
    				fa_icon: "fa fa-codepen"
    			},
    			$$inline: true
    		});

    	socialicon4 = new SocialIcon({
    			props: {
    				link: "https://t.me/KevindeMeijer",
    				color: "social-icon telegram",
    				fa_icon: "fa fa-telegram"
    			},
    			$$inline: true
    		});

    	socialicon5 = new SocialIcon({
    			props: {
    				link: "https://www.instagram.com/kevkevdemeijer/",
    				color: "social-icon instagram",
    				fa_icon: "fa fa-instagram"
    			},
    			$$inline: true
    		});

    	socialicon6 = new SocialIcon({
    			props: {
    				link: "https://www.twitch.tv/kevkev_beast",
    				color: "social-icon twitch",
    				fa_icon: "fa fa-twitch"
    			},
    			$$inline: true
    		});

    	socialicon7 = new SocialIcon({
    			props: {
    				link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    				color: "social-icon youtube",
    				fa_icon: "fa fa-youtube-play"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div = element("div");
    			create_component(socialicon0.$$.fragment);
    			t1 = space();
    			create_component(socialicon1.$$.fragment);
    			t2 = space();
    			create_component(socialicon2.$$.fragment);
    			t3 = space();
    			create_component(socialicon3.$$.fragment);
    			t4 = space();
    			create_component(socialicon4.$$.fragment);
    			t5 = space();
    			create_component(socialicon5.$$.fragment);
    			t6 = space();
    			create_component(socialicon6.$$.fragment);
    			t7 = space();
    			create_component(socialicon7.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link, file$2, 5, 2, 98);
    			add_location(div, file$2, 11, 0, 246);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(socialicon0, div, null);
    			append_dev(div, t1);
    			mount_component(socialicon1, div, null);
    			append_dev(div, t2);
    			mount_component(socialicon2, div, null);
    			append_dev(div, t3);
    			mount_component(socialicon3, div, null);
    			append_dev(div, t4);
    			mount_component(socialicon4, div, null);
    			append_dev(div, t5);
    			mount_component(socialicon5, div, null);
    			append_dev(div, t6);
    			mount_component(socialicon6, div, null);
    			append_dev(div, t7);
    			mount_component(socialicon7, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(socialicon0.$$.fragment, local);
    			transition_in(socialicon1.$$.fragment, local);
    			transition_in(socialicon2.$$.fragment, local);
    			transition_in(socialicon3.$$.fragment, local);
    			transition_in(socialicon4.$$.fragment, local);
    			transition_in(socialicon5.$$.fragment, local);
    			transition_in(socialicon6.$$.fragment, local);
    			transition_in(socialicon7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(socialicon0.$$.fragment, local);
    			transition_out(socialicon1.$$.fragment, local);
    			transition_out(socialicon2.$$.fragment, local);
    			transition_out(socialicon3.$$.fragment, local);
    			transition_out(socialicon4.$$.fragment, local);
    			transition_out(socialicon5.$$.fragment, local);
    			transition_out(socialicon6.$$.fragment, local);
    			transition_out(socialicon7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(socialicon0);
    			destroy_component(socialicon1);
    			destroy_component(socialicon2);
    			destroy_component(socialicon3);
    			destroy_component(socialicon4);
    			destroy_component(socialicon5);
    			destroy_component(socialicon6);
    			destroy_component(socialicon7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SocialIconArray', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SocialIconArray> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SocialIcon });
    	return [];
    }

    class SocialIconArray extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialIconArray",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\pages\Contact.svelte generated by Svelte v3.44.0 */
    const file$1 = "src\\components\\pages\\Contact.svelte";

    // (7:0) <Section id="contact" class="contact">
    function create_default_slot(ctx) {
    	let nav;
    	let t0;
    	let div0;
    	let h2;
    	let t2;
    	let br0;
    	let t3;
    	let p0;
    	let t4;
    	let br1;
    	let t5;
    	let t6;
    	let p1;
    	let t8;
    	let br2;
    	let t9;
    	let socialiconarray;
    	let t10;
    	let div1;
    	let iframe;
    	let iframe_src_value;
    	let current;

    	nav = new Nav({
    			props: { title: "Contact" },
    			$$inline: true
    		});

    	socialiconarray = new SocialIconArray({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Kevin de Meijer";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			p0 = element("p");
    			t4 = text("UX / UI Design ");
    			br1 = element("br");
    			t5 = text("Front-end Development");
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Feel free to get in Touch if you want to collaborate on something cool or\r\n      interesting. I'm always open to learn, and up for a challenge.";
    			t8 = space();
    			br2 = element("br");
    			t9 = space();
    			create_component(socialiconarray.$$.fragment);
    			t10 = space();
    			div1 = element("div");
    			iframe = element("iframe");
    			add_location(h2, file$1, 9, 4, 278);
    			add_location(br0, file$1, 10, 4, 308);
    			add_location(br1, file$1, 11, 22, 338);
    			add_location(p0, file$1, 11, 4, 320);
    			attr_dev(p1, "class", "bold");
    			add_location(p1, file$1, 12, 4, 375);
    			add_location(br2, file$1, 16, 4, 558);
    			attr_dev(div0, "class", "text svelte-xeqft7");
    			add_location(div0, file$1, 8, 2, 254);
    			attr_dev(iframe, "title", "Hot singles in my area");
    			attr_dev(iframe, "scrolling", "no");
    			attr_dev(iframe, "marginheight", "0");
    			attr_dev(iframe, "marginwidth", "0");
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://maps.google.com/maps?width=100%25&height=100%25&hl=nl&q=Gooise%20Meren+()&t=&z=7&ie=UTF8&iwloc=B&output=embed")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "100%");
    			attr_dev(iframe, "frameborder", "0");
    			set_style(iframe, "border", "0");
    			add_location(iframe, file$1, 21, 4, 628);
    			attr_dev(div1, "class", "map svelte-xeqft7");
    			add_location(div1, file$1, 20, 2, 605);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			append_dev(div0, t2);
    			append_dev(div0, br0);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(p0, t4);
    			append_dev(p0, br1);
    			append_dev(p0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, p1);
    			append_dev(div0, t8);
    			append_dev(div0, br2);
    			append_dev(div0, t9);
    			mount_component(socialiconarray, div0, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, iframe);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(socialiconarray.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(socialiconarray.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			destroy_component(socialiconarray);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(7:0) <Section id=\\\"contact\\\" class=\\\"contact\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				id: "contact",
    				class: "contact",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nav, Section, SocialIconArray });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let home;
    	let t0;
    	let about;
    	let t1;
    	let work;
    	let t2;
    	let contact;
    	let current;
    	home = new Home({ $$inline: true });
    	about = new About({ $$inline: true });
    	work = new Work({ $$inline: true });
    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(home.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(work.$$.fragment);
    			t2 = space();
    			create_component(contact.$$.fragment);
    			attr_dev(div, "class", "container svelte-1s1bje2");
    			add_location(div, file, 7, 0, 247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(home, div, null);
    			append_dev(div, t0);
    			mount_component(about, div, null);
    			append_dev(div, t1);
    			mount_component(work, div, null);
    			append_dev(div, t2);
    			mount_component(contact, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(work.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(work.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(home);
    			destroy_component(about);
    			destroy_component(work);
    			destroy_component(contact);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Home, About, Work, Contact });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
