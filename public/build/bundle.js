
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

    const file$a = "src\\components\\global\\Section.svelte";

    function create_fragment$a(ctx) {
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
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(/*$$props*/ ctx[0].class) + " svelte-10kwekl"));
    			add_location(section, file$a, 3, 0, 23);
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

    			if (!current || dirty & /*$$props*/ 1 && section_class_value !== (section_class_value = "" + (null_to_empty(/*$$props*/ ctx[0].class) + " svelte-10kwekl"))) {
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\global\NavItems.svelte generated by Svelte v3.44.0 */

    const file$9 = "src\\components\\global\\NavItems.svelte";

    function create_fragment$9(ctx) {
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
    			attr_dev(a0, "class", "svelte-taxa5");
    			add_location(a0, file$9, 2, 4, 56);
    			attr_dev(a1, "href", "#about");
    			attr_dev(a1, "class", "svelte-taxa5");
    			add_location(a1, file$9, 3, 4, 86);
    			attr_dev(a2, "href", "#work");
    			attr_dev(a2, "class", "svelte-taxa5");
    			add_location(a2, file$9, 4, 4, 118);
    			attr_dev(a3, "href", "#contact");
    			attr_dev(a3, "class", "svelte-taxa5");
    			add_location(a3, file$9, 5, 4, 148);
    			attr_dev(nav, "class", "brackets svelte-taxa5");
    			add_location(nav, file$9, 1, 2, 28);
    			attr_dev(div, "class", "navwrapper svelte-taxa5");
    			add_location(div, file$9, 0, 0, 0);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavItems",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\pages\Home.svelte generated by Svelte v3.44.0 */
    const file$8 = "src\\components\\pages\\Home.svelte";

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
    	let t17;
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
    			t17 = text("\r\n  >");
    			attr_dev(p0, "class", "perspective svelte-o6meks");
    			add_location(p0, file$8, 8, 6, 237);
    			attr_dev(p1, "class", "perspective svelte-o6meks");
    			add_location(p1, file$8, 9, 6, 270);
    			attr_dev(div0, "class", "perspective-line svelte-o6meks");
    			add_location(div0, file$8, 7, 4, 199);
    			attr_dev(p2, "class", "perspective svelte-o6meks");
    			add_location(p2, file$8, 12, 6, 369);
    			attr_dev(p3, "class", "perspective svelte-o6meks");
    			add_location(p3, file$8, 13, 6, 411);
    			attr_dev(div1, "class", "perspective-line svelte-o6meks");
    			add_location(div1, file$8, 11, 4, 331);
    			attr_dev(p4, "class", "perspective svelte-o6meks");
    			add_location(p4, file$8, 16, 6, 499);
    			attr_dev(p5, "class", "perspective svelte-o6meks");
    			add_location(p5, file$8, 17, 6, 539);
    			attr_dev(div2, "class", "perspective-line svelte-o6meks");
    			add_location(div2, file$8, 15, 4, 461);
    			attr_dev(p6, "class", "perspective svelte-o6meks");
    			add_location(p6, file$8, 20, 6, 624);
    			attr_dev(p7, "class", "perspective svelte-o6meks");
    			add_location(p7, file$8, 21, 6, 666);
    			attr_dev(div3, "class", "perspective-line svelte-o6meks");
    			add_location(div3, file$8, 19, 4, 586);
    			attr_dev(p8, "class", "perspective svelte-o6meks");
    			add_location(p8, file$8, 24, 6, 755);
    			attr_dev(div4, "class", "perspective-line svelte-o6meks");
    			add_location(div4, file$8, 23, 4, 717);
    			attr_dev(div5, "class", "perspective-text svelte-o6meks");
    			add_location(div5, file$8, 6, 2, 163);
    			attr_dev(div6, "class", "nav svelte-o6meks");
    			add_location(div6, file$8, 27, 2, 820);
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
    			insert_dev(target, t17, anchor);
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
    			if (detaching) detach_dev(t17);
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

    function create_fragment$8(ctx) {
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\global\Nav.svelte generated by Svelte v3.44.0 */
    const file$7 = "src\\components\\global\\Nav.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let navitems;
    	let current;
    	navitems = new NavItems({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			create_component(navitems.$$.fragment);
    			add_location(h1, file$7, 7, 2, 122);
    			attr_dev(div, "class", "chapter_title svelte-1lv1dot");
    			add_location(div, file$7, 6, 0, 91);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			mount_component(navitems, div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_component(navitems);
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

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$7.name
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

    const file$6 = "src\\components\\content\\Skillbars.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let span;
    	let t0;
    	let t1;
    	let div0;
    	let t2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			t0 = text(/*skill*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(" ");
    			attr_dev(span, "class", "skill svelte-1oj4zbu");
    			add_location(span, file$6, 23, 2, 529);
    			attr_dev(div0, "class", "skills svelte-1oj4zbu");
    			set_style(div0, "width", /*$progress*/ ctx[2] + "%");
    			set_style(div0, "background-image", /*color*/ ctx[1]);
    			add_location(div0, file$6, 24, 2, 567);
    			attr_dev(div1, "class", "container svelte-1oj4zbu");
    			add_location(div1, file$6, 22, 0, 502);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, t0);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			skill: 0,
    			percent: 4,
    			color: 1,
    			delTime: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skillbars",
    			options,
    			id: create_fragment$6.name
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
    const file$5 = "src\\components\\content\\Skills.svelte";

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

    function create_fragment$5(ctx) {
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

    			add_location(div, file$5, 44, 0, 906);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\pages\About.svelte generated by Svelte v3.44.0 */
    const file$4 = "src\\components\\pages\\About.svelte";

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
    	let h20;
    	let t10;
    	let p3;
    	let t11;
    	let a1;
    	let t12;
    	let t13;
    	let t14;
    	let h21;
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
    			p1.textContent = "My areas of expertise encompass all Front-end work you can dream of: from\r\n      creating a sketch, working it out digitally, devoloping the first\r\n      prototype, to the last bits of css that are causing a headache.";
    			t4 = space();
    			p2 = element("p");
    			t5 = text("I am currently studying at\r\n      ");
    			a0 = element("a");
    			t6 = text("Hogeschool Utrecht");
    			t7 = text(" based in the\r\n      Netherlands.");
    			t8 = space();
    			h20 = element("h2");
    			h20.textContent = "Art Style";
    			t10 = space();
    			p3 = element("p");
    			t11 = text("I love pastels and also the colors\r\n      ");
    			a1 = element("a");
    			t12 = text("Piet Mondriaan");
    			t13 = text("\r\n      used in his paintings.");
    			t14 = space();
    			h21 = element("h2");
    			h21.textContent = "My Skills";
    			t16 = space();
    			create_component(skills.$$.fragment);
    			attr_dev(p0, "class", "bold");
    			add_location(p0, file$4, 12, 4, 360);
    			add_location(p1, file$4, 16, 4, 482);
    			attr_dev(a0, "class", "link");
    			attr_dev(a0, "href", HU);
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$4, 24, 6, 773);
    			add_location(p2, file$4, 22, 4, 728);
    			attr_dev(h20, "class", "svelte-y03g5h");
    			add_location(h20, file$4, 28, 4, 888);
    			attr_dev(a1, "class", "link");
    			attr_dev(a1, "href", Mondriaan);
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$4, 31, 6, 965);
    			add_location(p3, file$4, 29, 4, 912);
    			attr_dev(h21, "class", "svelte-y03g5h");
    			add_location(h21, file$4, 35, 4, 1081);
    			attr_dev(div, "class", "text");
    			add_location(div, file$4, 11, 2, 336);
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
    			append_dev(div, h20);
    			append_dev(div, t10);
    			append_dev(div, p3);
    			append_dev(p3, t11);
    			append_dev(p3, a1);
    			append_dev(a1, t12);
    			append_dev(p3, t13);
    			append_dev(div, t14);
    			append_dev(div, h21);
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

    function create_fragment$4(ctx) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const Mondriaan = 'https://en.wikipedia.org/wiki/Piet_Mondrian';
    const HU = 'https://www.hu.nl/';

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\pages\Work.svelte generated by Svelte v3.44.0 */
    const file$3 = "src\\components\\pages\\Work.svelte";

    // (6:0) <Section id="work" class="work">
    function create_default_slot$1(ctx) {
    	let nav;
    	let t0;
    	let div;
    	let h1;
    	let t2;
    	let p;
    	let current;
    	nav = new Nav({ props: { title: "Work" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Timeline";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Work in progress...";
    			add_location(h1, file$3, 8, 4, 201);
    			add_location(p, file$3, 9, 4, 224);
    			attr_dev(div, "class", "text");
    			add_location(div, file$3, 7, 2, 177);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(6:0) <Section id=\\\"work\\\" class=\\\"work\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Work', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Nav, Section });
    	return [];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\content\SocialIcon.svelte generated by Svelte v3.44.0 */

    const file$2 = "src\\components\\content\\SocialIcon.svelte";

    function create_fragment$2(ctx) {
    	let link_1;
    	let t;
    	let div2;
    	let a;
    	let div1;
    	let div0;
    	let i;
    	let i_class_value;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			link_1 = element("link");
    			t = space();
    			div2 = element("div");
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			attr_dev(link_1, "rel", "stylesheet");
    			attr_dev(link_1, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link_1, file$2, 7, 2, 104);
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*fa_icon*/ ctx[2]) + " svelte-1b4qrt6"));
    			add_location(i, file$2, 17, 8, 369);
    			attr_dev(div0, "class", "icon svelte-1b4qrt6");
    			add_location(div0, file$2, 16, 6, 341);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*color*/ ctx[1]) + " svelte-1b4qrt6"));
    			add_location(div1, file$2, 15, 4, 314);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", /*link*/ ctx[0]);
    			attr_dev(a, "class", "svelte-1b4qrt6");
    			add_location(a, file$2, 14, 2, 277);
    			attr_dev(div2, "class", "socials svelte-1b4qrt6");
    			add_location(div2, file$2, 13, 0, 252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link_1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fa_icon*/ 4 && i_class_value !== (i_class_value = "" + (null_to_empty(/*fa_icon*/ ctx[2]) + " svelte-1b4qrt6"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*color*/ 2 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*color*/ ctx[1]) + " svelte-1b4qrt6"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*link*/ 1) {
    				attr_dev(a, "href", /*link*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link_1);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div2);
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { link: 0, color: 1, fa_icon: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialIcon",
    			options,
    			id: create_fragment$2.name
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

    /* src\components\pages\Contact.svelte generated by Svelte v3.44.0 */
    const file$1 = "src\\components\\pages\\Contact.svelte";

    // (14:0) <Section id="contact" class="contact">
    function create_default_slot(ctx) {
    	let nav;
    	let t0;
    	let div0;
    	let h20;
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
    	let p2;
    	let t10;
    	let h21;
    	let t12;
    	let br2;
    	let t13;
    	let socialicon0;
    	let t14;
    	let socialicon1;
    	let t15;
    	let socialicon2;
    	let t16;
    	let socialicon3;
    	let t17;
    	let socialicon4;
    	let t18;
    	let socialicon5;
    	let t19;
    	let socialicon6;
    	let t20;
    	let socialicon7;
    	let t21;
    	let div1;
    	let iframe;
    	let iframe_src_value;
    	let current;

    	nav = new Nav({
    			props: { title: "Contact" },
    			$$inline: true
    		});

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
    				link: "https://www.instagram.com/kevkevdemeijer/",
    				color: "social-icon instagram",
    				fa_icon: "fa fa-instagram"
    			},
    			$$inline: true
    		});

    	socialicon3 = new SocialIcon({
    			props: {
    				link: "https://www.linkedin.com/in/kevindemeijer/",
    				color: "social-icon instagram",
    				fa_icon: "fa fa-linkedin-square"
    			},
    			$$inline: true
    		});

    	socialicon4 = new SocialIcon({
    			props: {
    				link: "https://codepen.io/Kevin_de_Meijer",
    				color: "social-icon codepen",
    				fa_icon: "fa fa-codepen"
    			},
    			$$inline: true
    		});

    	socialicon5 = new SocialIcon({
    			props: {
    				link: "https://t.me/KevindeMeijer",
    				color: "social-icon telegram",
    				fa_icon: "fa fa-telegram"
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
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Kevin de Meijer";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			p0 = element("p");
    			t4 = text("UX / UI Design ");
    			br1 = element("br");
    			t5 = text("Front-end Development");
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Feel free to get in Touch if you want to collaborate on something cool or\r\n      interesting. I'm always open to learn and up for a challenge.";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "I'm currently unavailible for any projects that fall outside of my study.";
    			t10 = space();
    			h21 = element("h2");
    			h21.textContent = "Visit one of my socials for more about me...";
    			t12 = space();
    			br2 = element("br");
    			t13 = space();
    			create_component(socialicon0.$$.fragment);
    			t14 = space();
    			create_component(socialicon1.$$.fragment);
    			t15 = space();
    			create_component(socialicon2.$$.fragment);
    			t16 = space();
    			create_component(socialicon3.$$.fragment);
    			t17 = space();
    			create_component(socialicon4.$$.fragment);
    			t18 = space();
    			create_component(socialicon5.$$.fragment);
    			t19 = space();
    			create_component(socialicon6.$$.fragment);
    			t20 = space();
    			create_component(socialicon7.$$.fragment);
    			t21 = space();
    			div1 = element("div");
    			iframe = element("iframe");
    			add_location(h20, file$1, 16, 4, 433);
    			add_location(br0, file$1, 17, 4, 463);
    			add_location(br1, file$1, 18, 22, 493);
    			add_location(p0, file$1, 18, 4, 475);
    			attr_dev(p1, "class", "bold");
    			add_location(p1, file$1, 19, 4, 530);
    			add_location(p2, file$1, 23, 4, 712);
    			add_location(h21, file$1, 27, 4, 814);
    			add_location(br2, file$1, 28, 4, 873);
    			attr_dev(div0, "class", "text svelte-1udb3h3");
    			add_location(div0, file$1, 15, 2, 409);
    			iframe.allowFullscreen = true;
    			attr_dev(iframe, "title", "Hot singles in my area");
    			attr_dev(iframe, "scrolling", "no");
    			attr_dev(iframe, "marginheight", "0");
    			attr_dev(iframe, "marginwidth", "0");
    			if (!src_url_equal(iframe.src, iframe_src_value = "https://maps.google.com/maps?width=100%25&height=100%25&hl=nl&q=Naarden+()&t=&z=12&ie=UTF8&iwloc=B&output=embed")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "100%");
    			attr_dev(iframe, "frameborder", "0");
    			set_style(iframe, "border", "0");
    			add_location(iframe, file$1, 79, 4, 2088);
    			attr_dev(div1, "class", "map svelte-1udb3h3");
    			add_location(div1, file$1, 78, 2, 2065);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h20);
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
    			append_dev(div0, p2);
    			append_dev(div0, t10);
    			append_dev(div0, h21);
    			append_dev(div0, t12);
    			append_dev(div0, br2);
    			append_dev(div0, t13);
    			mount_component(socialicon0, div0, null);
    			append_dev(div0, t14);
    			mount_component(socialicon1, div0, null);
    			append_dev(div0, t15);
    			mount_component(socialicon2, div0, null);
    			append_dev(div0, t16);
    			mount_component(socialicon3, div0, null);
    			append_dev(div0, t17);
    			mount_component(socialicon4, div0, null);
    			append_dev(div0, t18);
    			mount_component(socialicon5, div0, null);
    			append_dev(div0, t19);
    			mount_component(socialicon6, div0, null);
    			append_dev(div0, t20);
    			mount_component(socialicon7, div0, null);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, iframe);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
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
    			transition_out(nav.$$.fragment, local);
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
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			destroy_component(socialicon0);
    			destroy_component(socialicon1);
    			destroy_component(socialicon2);
    			destroy_component(socialicon3);
    			destroy_component(socialicon4);
    			destroy_component(socialicon5);
    			destroy_component(socialicon6);
    			destroy_component(socialicon7);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:0) <Section id=\\\"contact\\\" class=\\\"contact\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let link;
    	let t;
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
    			link = element("link");
    			t = space();
    			create_component(section.$$.fragment);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link, file$1, 7, 2, 192);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t, anchor);
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
    			detach_dev(link);
    			if (detaching) detach_dev(t);
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

    	$$self.$capture_state = () => ({ Nav, Section, SocialIcon });
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
    			attr_dev(div, "class", "container svelte-vq3y01");
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
